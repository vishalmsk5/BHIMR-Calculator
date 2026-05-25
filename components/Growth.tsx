import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR = '#2E7D32';

const MODES = [
  { id: 'wastage', label: '% Wastage', icon: '🏭', desc: 'Material loss calculation' },
  { id: 'profit', label: 'Profit/Loss %', icon: '💰', desc: 'Buy/sell margin' },
  { id: 'compound', label: 'Compound Growth', icon: '📈', desc: 'CAGR & compounding' },
  { id: 'markup', label: 'Markup/Margin', icon: '🏷️', desc: 'Retail pricing' },
  { id: 'breakeven', label: 'Break Even', icon: '⚖️', desc: 'Fixed + variable costs' },
];

export default function GrowthWastageScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const [modeIdx, setModeIdx] = useState(0);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [result, setResult] = useState<{ lines: string[]; main: string } | null>(null);

  const fmt = (n: number) => parseFloat(n.toPrecision(8)).toString();

  const calculate = () => {
    const A = parseFloat(a), B = parseFloat(b), C = parseFloat(c);
    const mode = MODES[modeIdx].id;

    if (mode === 'wastage') {
      if (isNaN(A) || isNaN(B)) { setResult({ lines: ['Enter Base & Wastage %'], main: '' }); return; }
      const waste = (A * B) / 100;
      const net = A + waste;
      setResult({ lines: [`Base: ${A}`, `Wastage ${B}%: ${fmt(waste)}`, `Total required: ${fmt(net)}`], main: fmt(net) });
    } else if (mode === 'profit') {
      if (isNaN(A) || isNaN(B)) { setResult({ lines: ['Enter Cost & Sell Price'], main: '' }); return; }
      const diff = B - A, pct = (diff / A) * 100;
      const label = diff >= 0 ? 'Profit' : 'Loss';
      setResult({ lines: [`Cost: ${A}`, `Sell: ${B}`, `${label}: ${fmt(Math.abs(diff))}`, `${label} %: ${fmt(Math.abs(pct))}%`], main: fmt(Math.abs(pct)) + '%' });
    } else if (mode === 'compound') {
      if (isNaN(A) || isNaN(B) || isNaN(C)) { setResult({ lines: ['Enter Principal, Rate %, Years'], main: '' }); return; }
      const final = A * Math.pow(1 + B / 100, C);
      const interest = final - A;
      setResult({ lines: [`Principal: ${A}`, `Rate: ${B}%`, `Years: ${C}`, `Final: ${fmt(final)}`, `Interest earned: ${fmt(interest)}`], main: fmt(final) });
    } else if (mode === 'markup') {
      if (isNaN(A) || isNaN(B)) { setResult({ lines: ['Enter Cost & Markup %'], main: '' }); return; }
      const sell = A * (1 + B / 100);
      const margin = ((sell - A) / sell) * 100;
      setResult({ lines: [`Cost: ${A}`, `Markup: ${B}%`, `Sell Price: ${fmt(sell)}`, `Gross Margin: ${fmt(margin)}%`], main: fmt(sell) });
    } else if (mode === 'breakeven') {
      if (isNaN(A) || isNaN(B) || isNaN(C)) { setResult({ lines: ['Enter Fixed Costs, Price, Variable Cost'], main: '' }); return; }
      const units = A / (B - C);
      const revenue = units * B;
      setResult({ lines: [`Fixed Costs: ${A}`, `Price per unit: ${B}`, `Variable cost/unit: ${C}`, `Break-even units: ${fmt(units)}`, `Break-even revenue: ${fmt(revenue)}`], main: fmt(units) });
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

  const mode = MODES[modeIdx];
  const labels = modeIdx === 0 ? ['Base Amount', 'Wastage %', '']
    : modeIdx === 1 ? ['Cost Price', 'Sell Price', '']
    : modeIdx === 2 ? ['Principal (₹)', 'Rate (%)', 'Years']
    : modeIdx === 3 ? ['Cost Price', 'Markup %', '']
    : ['Fixed Costs', 'Price/Unit', 'Variable Cost/Unit'];

  return (
    <>
      <Stack.Screen options={{
        title: '% Growth & Wastage',
        headerStyle: { backgroundColor: COLOR },
        headerTintColor: '#FFF',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        ),
      }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>

          <View style={[styles.infoCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.infoText}>
              💡 <Text style={{ fontWeight: '700' }}>Industry Use:</Text> Manufacturing managers computing raw material wastage budgets, or IT startups evaluating quarterly compound revenue growth.
            </Text>
          </View>

          {/* Mode tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll}>
            {MODES.map((m, i) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeChip, {
                  backgroundColor: modeIdx === i ? COLOR : theme.surface,
                  borderColor: modeIdx === i ? COLOR : theme.border,
                }]}
                onPress={() => { setModeIdx(i); setResult(null); setA(''); setB(''); setC(''); }}
              >
                <Text style={styles.modeIcon}>{m.icon}</Text>
                <Text style={[styles.modeLabel, { color: modeIdx === i ? '#FFF' : theme.text }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>{mode.desc}</Text>

          {/* Inputs */}
          {labels[0] ? (
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder={labels[0]}
              placeholderTextColor={theme.textSecondary}
              value={a} onChangeText={setA} keyboardType="decimal-pad"
            />
          ) : null}
          {labels[1] ? (
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder={labels[1]}
              placeholderTextColor={theme.textSecondary}
              value={b} onChangeText={setB} keyboardType="decimal-pad"
            />
          ) : null}
          {labels[2] ? (
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder={labels[2]}
              placeholderTextColor={theme.textSecondary}
              value={c} onChangeText={setC} keyboardType="decimal-pad"
            />
          ) : null}

          <TouchableOpacity style={[styles.runBtn, { backgroundColor: COLOR }]} onPress={calculate}>
            <Text style={styles.runBtnText}>▶ RUN DYNAMIC COMPUTATION</Text>
          </TouchableOpacity>

          {result && (
            <View style={[styles.resultCard, { backgroundColor: COLOR }]}>
              <Text style={styles.resultLabel}>{mode.icon} {mode.label}</Text>
              {result.lines.map((line, i) => (
                <Text key={i} style={styles.resultLine}>{line}</Text>
              ))}
              {result.main ? (
                <Text style={styles.resultMain}>{result.main}</Text>
              ) : null}
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => result.main && Clipboard.setString(result.main)}>
                  <Ionicons name="copy-outline" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>COPY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={saveToNotes}>
                  <Ionicons name="save-outline" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>SAVE TO NOTES</Text>
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
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  infoCard: { padding: 12, borderRadius: 10, marginBottom: 14 },
  infoText: { fontSize: 13, color: '#2E7D32', lineHeight: 19 },
  modeScroll: { marginBottom: 8 },
  modeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, marginRight: 8,
  },
  modeIcon: { fontSize: 15 },
  modeLabel: { fontSize: 12, fontWeight: '600' },
  modeDesc: { fontSize: 12, marginBottom: 14, marginTop: 4 },
  input: {
    padding: 14, borderRadius: 12, fontSize: 16, fontWeight: '600',
    borderWidth: 1, marginBottom: 10,
  },
  runBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 4, marginBottom: 14 },
  runBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  resultCard: { borderRadius: 14, padding: 18 },
  resultLabel: { color: '#A5D6A7', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  resultLine: { color: '#FFF', fontSize: 14, lineHeight: 22 },
  resultMain: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 8, marginBottom: 8 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});