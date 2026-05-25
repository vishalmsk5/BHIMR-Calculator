import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR = '#00695C';

const MODES = [
  { id: 'power', label: 'xʸ Power', icon: '⚡', desc: 'Base to the power of exponent' },
  { id: 'root', label: 'ⁿ√ Root', icon: '√', desc: 'nth root of a number' },
  { id: 'log', label: 'log / ln', icon: '📊', desc: 'Logarithm (base 10 or natural)' },
  { id: 'compound', label: 'Compound', icon: '💹', desc: 'Exponential compound formula' },
  { id: 'binary', label: 'Binary Powers', icon: '💻', desc: 'Computer science: 2^n bytes' },
];

export default function ExponentsScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const [modeIdx, setModeIdx] = useState(0);
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState('');
  const [result, setResult] = useState<{ lines: string[]; main: string } | null>(null);

  const fmt = (n: number) => {
    if (!isFinite(n)) return 'Undefined';
    if (Math.abs(n) > 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(4);
    return parseFloat(n.toPrecision(10)).toString();
  };

  const calculate = () => {
    const A = parseFloat(a), B = parseFloat(b), C = parseFloat(c);
    const mode = MODES[modeIdx].id;

    if (mode === 'power') {
      if (isNaN(A) || isNaN(B)) { setResult({ lines: ['Enter base and exponent'], main: '' }); return; }
      const r = Math.pow(A, B);
      setResult({ lines: [`${A}^${B} = ${fmt(r)}`], main: fmt(r) });
    } else if (mode === 'root') {
      if (isNaN(A)) { setResult({ lines: ['Enter number (and n for nth root)'], main: '' }); return; }
      const n = isNaN(B) ? 2 : B;
      const r = Math.pow(A, 1 / n);
      setResult({ lines: [`${n === 2 ? '√' : n + '√'}${A} = ${fmt(r)}`], main: fmt(r) });
    } else if (mode === 'log') {
      if (isNaN(A)) { setResult({ lines: ['Enter number'], main: '' }); return; }
      const log10 = Math.log10(A), ln = Math.log(A);
      const logB = isNaN(B) ? null : Math.log(A) / Math.log(B);
      const lines = [`log₁₀(${A}) = ${fmt(log10)}`, `ln(${A}) = ${fmt(ln)}`];
      if (logB !== null) lines.push(`log₍${B}₎(${A}) = ${fmt(logB)}`);
      setResult({ lines, main: fmt(log10) });
    } else if (mode === 'compound') {
      if (isNaN(A) || isNaN(B) || isNaN(C)) { setResult({ lines: ['Enter Principal, Rate%, Years'], main: '' }); return; }
      const r = A * Math.pow(1 + B / 100, C);
      const interest = r - A;
      const doublingYears = 72 / B; // Rule of 72
      setResult({ lines: [`P = ${A}, r = ${B}%, n = ${C} yrs`, `Final: ${fmt(r)}`, `Interest: ${fmt(interest)}`, `Rule of 72: doubles in ${fmt(doublingYears)} yrs`], main: fmt(r) });
    } else if (mode === 'binary') {
      if (isNaN(A)) { setResult({ lines: ['Enter power of 2 (e.g. 10 for 1KB)'], main: '' }); return; }
      const r = Math.pow(2, A);
      const kb = r / 1024, mb = kb / 1024, gb = mb / 1024;
      const lines = [`2^${A} = ${fmt(r)} bytes`];
      if (kb >= 1) lines.push(`= ${fmt(kb)} KB`);
      if (mb >= 1) lines.push(`= ${fmt(mb)} MB`);
      if (gb >= 1) lines.push(`= ${fmt(gb)} GB`);
      setResult({ lines, main: fmt(r) });
    }
  };

  const saveToNotes = async () => {
    if (!result) return;
    try {
      const text = `[${MODES[modeIdx].label}]\n` + result.lines.join('\n');
      const stored = await AsyncStorage.getItem('@bhim_calculation_notes');
      const notes = stored ? JSON.parse(stored) : [];
      notes.unshift({ id: Date.now().toString(), text, timestamp: Date.now() });
      await AsyncStorage.setItem('@bhim_calculation_notes', JSON.stringify(notes.slice(0, 100)));
      alert('Saved to Notes!');
    } catch {}
  };

  const placeholders = modeIdx === 0 ? ['Base (x)', 'Exponent (y)', '']
    : modeIdx === 1 ? ['Number', 'n (default: 2)', '']
    : modeIdx === 2 ? ['Number', 'Custom base (optional)', '']
    : modeIdx === 3 ? ['Principal', 'Rate (%)', 'Years']
    : ['Power of 2 (n)', '', ''];

  return (
    <>
      <Stack.Screen options={{
        title: 'xʸ Exponents & Roots', headerStyle: { backgroundColor: COLOR },
        headerTintColor: '#FFF',
        headerLeft: () => <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>,
      }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: '#E0F2F1' }]}>
            <Text style={[styles.infoText, { color: COLOR }]}>💡 <Text style={{ fontWeight: '700' }}>Tech Use:</Text> Server byte allocations (2¹⁰ = 1KB). Pharmacology tracking exponential bacterial growth. Compound interest modeling.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {MODES.map((m, i) => (
              <TouchableOpacity key={m.id} style={[styles.chip, { backgroundColor: modeIdx === i ? COLOR : theme.surface, borderColor: modeIdx === i ? COLOR : theme.border }]}
                onPress={() => { setModeIdx(i); setResult(null); setA(''); setB(''); setC(''); }}>
                <Text style={styles.chipIcon}>{m.icon}</Text>
                <Text style={[styles.chipLabel, { color: modeIdx === i ? '#FFF' : theme.text }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[styles.desc, { color: theme.textSecondary }]}>{MODES[modeIdx].desc}</Text>
          {placeholders.map((ph, i) => ph ? (
            <TextInput key={i} style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder={ph} placeholderTextColor={theme.textSecondary}
              value={[a, b, c][i]} onChangeText={[setA, setB, setC][i]} keyboardType="decimal-pad" />
          ) : null)}
          <TouchableOpacity style={[styles.runBtn, { backgroundColor: COLOR }]} onPress={calculate}>
            <Text style={styles.runBtnText}>▶ RUN COMPUTATION</Text>
          </TouchableOpacity>
          {result && (
            <View style={[styles.resultCard, { backgroundColor: COLOR }]}>
              {result.lines.map((line, i) => <Text key={i} style={styles.resultLine}>{line}</Text>)}
              {result.main ? <Text style={styles.resultMain}>{result.main}</Text> : null}
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => result.main && Clipboard.setString(result.main)}>
                  <Ionicons name="copy-outline" size={16} color="#FFF" /><Text style={styles.actionBtnText}>COPY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={saveToNotes}>
                  <Ionicons name="save-outline" size={16} color="#FFF" /><Text style={styles.actionBtnText}>SAVE TO NOTES</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 40 },
  infoCard: { padding: 12, borderRadius: 10, marginBottom: 14 },
  infoText: { fontSize: 13, lineHeight: 19 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipIcon: { fontSize: 14 }, chipLabel: { fontSize: 12, fontWeight: '600' },
  desc: { fontSize: 12, marginBottom: 12 },
  input: { padding: 14, borderRadius: 12, fontSize: 16, fontWeight: '600', borderWidth: 1, marginBottom: 10 },
  runBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  runBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  resultCard: { borderRadius: 14, padding: 18 },
  resultLine: { color: '#FFF', fontSize: 14, lineHeight: 22 },
  resultMain: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 8, marginBottom: 8 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});