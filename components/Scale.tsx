// ============================================================
// Scale & Proportions Screen
// ============================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR = '#E65100';

const MODES = [
  { id: 'ratio', label: 'Simple Ratio', icon: '⚖️', desc: 'A:B ratio solve' },
  { id: 'concrete', label: 'Concrete Mix', icon: '🏗️', desc: 'M20/M25 grade mix' },
  { id: 'blueprint', label: 'Blueprint Scale', icon: '📐', desc: 'Drawing scale calculator' },
  { id: 'recipe', label: 'Recipe Scale', icon: '🍳', desc: 'Ingredient proportions' },
  { id: 'chemical', label: 'Chemical Mix', icon: '⚗️', desc: 'Compound proportions' },
];

export default function ScaleScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const [modeIdx, setModeIdx] = useState(0);
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState('');
  const [result, setResult] = useState<{ lines: string[] } | null>(null);

  const fmt = (n: number) => parseFloat(n.toPrecision(8)).toString();

  const calculate = () => {
    const A = parseFloat(a), B = parseFloat(b), C = parseFloat(c);
    const mode = MODES[modeIdx].id;
    if (mode === 'ratio') {
      if (isNaN(A) || isNaN(B) || isNaN(C)) { setResult({ lines: ['Enter A, B, and total amount'] }); return; }
      const total = A + B;
      const pa = (A / total) * C, pb = (B / total) * C;
      setResult({ lines: [`Ratio: ${A}:${B} → Total: ${C}`, `Part A (${A}): ${fmt(pa)}`, `Part B (${B}): ${fmt(pb)}`] });
    } else if (mode === 'concrete') {
      if (isNaN(A)) { setResult({ lines: ['Enter total volume (m³)'] }); return; }
      const cement = A * 320, sand = A * 640, aggregate = A * 1280, water = A * 160;
      setResult({ lines: [`Volume: ${A} m³`, `Cement: ${fmt(cement)} kg`, `Sand: ${fmt(sand)} kg`, `Aggregate: ${fmt(aggregate)} kg`, `Water: ${fmt(water)} L`, `(M20 grade: 1:1.5:3)`] });
    } else if (mode === 'blueprint') {
      if (isNaN(A) || isNaN(B)) { setResult({ lines: ['Enter drawing size & scale (e.g. 1:100)'] }); return; }
      const actual = A * B;
      setResult({ lines: [`Drawing: ${A} mm @ 1:${B}`, `Actual size: ${fmt(actual)} mm`, `= ${fmt(actual / 1000)} m`, `= ${fmt(actual / 25.4)} inches`] });
    } else if (mode === 'recipe') {
      if (isNaN(A) || isNaN(B) || isNaN(C)) { setResult({ lines: ['Enter original serves, ingredient amount, new serves'] }); return; }
      const scaled = (B / A) * C;
      setResult({ lines: [`Original: ${A} serves → ${B} units`, `New serves: ${C}`, `Scaled ingredient: ${fmt(scaled)} units`, `Scale factor: ${fmt(C / A)}x`] });
    } else if (mode === 'chemical') {
      if (isNaN(A) || isNaN(B) || isNaN(C)) { setResult({ lines: ['Enter Component1 parts, Component2 parts, total volume'] }); return; }
      const total = A + B, v1 = (A / total) * C, v2 = (B / total) * C;
      setResult({ lines: [`Mix ratio: ${A}:${B}`, `Total: ${C} units`, `Component 1: ${fmt(v1)}`, `Component 2: ${fmt(v2)}`] });
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

  const placeholders = modeIdx === 0 ? ['Part A', 'Part B', 'Total Amount']
    : modeIdx === 1 ? ['Volume (m³)', '', '']
    : modeIdx === 2 ? ['Drawing size (mm)', 'Scale (e.g. 100)', '']
    : modeIdx === 3 ? ['Original serves', 'Ingredient amount', 'New serves']
    : ['Component 1 parts', 'Component 2 parts', 'Total volume'];

  return (
    <>
      <Stack.Screen options={{
        title: 'A:B Scale & Proportions', headerStyle: { backgroundColor: COLOR },
        headerTintColor: '#FFF',
        headerLeft: () => <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>,
      }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.infoText, { color: COLOR }]}>💡 Civil engineers calculating cement-sand-water for M20 concrete. Architects scaling blueprint drawings.</Text>
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
              <View style={styles.resultActions}>
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
  input: { padding: 14, borderRadius: 12, fontSize: 16, fontWeight: '600', borderWidth: 1, marginBottom: 10 },
  runBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  runBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  resultCard: { borderRadius: 14, padding: 18 },
  resultLine: { color: '#FFF', fontSize: 14, lineHeight: 22 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});