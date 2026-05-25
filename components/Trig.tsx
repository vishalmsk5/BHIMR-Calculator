import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';


const COLOR = '#6A1B9A';

const MODES = [
  { id: 'basic', label: 'Basic Trig', icon: '📐', desc: 'sin, cos, tan of any angle' },
  { id: 'inverse', label: 'Inverse Trig', icon: '🔄', desc: 'arcsin, arccos, arctan' },
  { id: 'vector', label: 'Vector Magnitude', icon: '➡️', desc: '2D/3D vector length' },
  { id: 'angle', label: 'Triangle Solver', icon: '△', desc: 'Sides & angles from inputs' },
  { id: 'solar', label: 'Solar Angle', icon: '☀️', desc: 'Panel tilt angle optimizer' },
];

export default function TrigScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const [modeIdx, setModeIdx] = useState(0);
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState('');
  const [isDeg, setIsDeg] = useState(true);
  const [result, setResult] = useState<{ lines: string[]; main: string } | null>(null);

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const fmt = (n: number) => isFinite(n) ? parseFloat(n.toPrecision(8)).toString() : 'Undefined';

  const calculate = () => {
    const A = parseFloat(a), B = parseFloat(b), C = parseFloat(c);
    const mode = MODES[modeIdx].id;

    if (mode === 'basic') {
      if (isNaN(A)) { setResult({ lines: ['Enter angle'], main: '' }); return; }
      const rad = isDeg ? toRad(A) : A;
      const sinV = Math.sin(rad), cosV = Math.cos(rad), tanV = Math.tan(rad);
      setResult({ lines: [`Angle: ${A}${isDeg ? '°' : ' rad'}`, `sin = ${fmt(sinV)}`, `cos = ${fmt(cosV)}`, `tan = ${fmt(tanV)}`], main: fmt(sinV) });
    } else if (mode === 'inverse') {
      if (isNaN(A)) { setResult({ lines: ['Enter value (-1 to 1)'], main: '' }); return; }
      const asinV = toDeg(Math.asin(A)), acosV = toDeg(Math.acos(A)), atanV = toDeg(Math.atan(A));
      setResult({ lines: [`Value: ${A}`, `arcsin = ${fmt(asinV)}°`, `arccos = ${fmt(acosV)}°`, `arctan = ${fmt(atanV)}°`], main: fmt(asinV) + '°' });
    } else if (mode === 'vector') {
      if (isNaN(A) || isNaN(B)) { setResult({ lines: ['Enter X, Y (and Z for 3D)'], main: '' }); return; }
      const mag = isNaN(C) ? Math.sqrt(A * A + B * B) : Math.sqrt(A * A + B * B + C * C);
      const angle = isNaN(C) ? toDeg(Math.atan2(B, A)) : 0;
      const lines = [`X: ${A}, Y: ${B}${!isNaN(C) ? `, Z: ${C}` : ''}`, `Magnitude: ${fmt(mag)}`];
      if (isNaN(C)) lines.push(`Direction angle: ${fmt(angle)}°`);
      setResult({ lines, main: fmt(mag) });
    } else if (mode === 'angle') {
      if (isNaN(A) || isNaN(B)) { setResult({ lines: ['Enter 2 sides (and angle for SAS)'], main: '' }); return; }
      if (!isNaN(C)) {
        const rad = toRad(C);
        const third = Math.sqrt(A * A + B * B - 2 * A * B * Math.cos(rad));
        setResult({ lines: [`Side a: ${A}, Side b: ${B}, Angle C: ${C}°`, `Side c: ${fmt(third)}`, `Area: ${fmt(0.5 * A * B * Math.sin(rad))}`], main: fmt(third) });
      } else {
        const hyp = Math.sqrt(A * A + B * B);
        const angleA = toDeg(Math.atan(B / A));
        setResult({ lines: [`Legs: ${A}, ${B}`, `Hypotenuse: ${fmt(hyp)}`, `Angle A: ${fmt(angleA)}°`, `Angle B: ${fmt(90 - angleA)}°`], main: fmt(hyp) });
      }
    } else if (mode === 'solar') {
      if (isNaN(A)) { setResult({ lines: ['Enter latitude (degrees)'], main: '' }); return; }
      const tilt = A; // optimal tilt ≈ latitude
      const summer = A - 23.5, winter = A + 23.5;
      setResult({ lines: [`Latitude: ${A}°`, `Optimal annual tilt: ${fmt(tilt)}°`, `Summer tilt: ${fmt(summer)}°`, `Winter tilt: ${fmt(winter)}°`, `Note: Adjust ±15° seasonally`], main: fmt(tilt) + '°' });
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
  const placeholders = modeIdx === 0 ? ['Angle', '', '']
    : modeIdx === 1 ? ['Value (−1 to 1)', '', '']
    : modeIdx === 2 ? ['X component', 'Y component', 'Z (optional)']
    : modeIdx === 3 ? ['Side a', 'Side b', 'Angle C° (optional)']
    : ['Latitude (°)', '', ''];

  return (
    <>
      <Stack.Screen options={{
        title: 'f(x) Trigonometry & Vectors',
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
          <View style={[styles.infoCard, { backgroundColor: '#F3E5F5' }]}>
            <Text style={styles.infoText}>
              💡 <Text style={{ fontWeight: '700' }}>Industry Use:</Text> Solar engineers calculating optimal tilt pitch for rooftop panels. Structural engineers computing load vectors.
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {MODES.map((m, i) => (
              <TouchableOpacity key={m.id}
                style={[styles.chip, { backgroundColor: modeIdx === i ? COLOR : theme.surface, borderColor: modeIdx === i ? COLOR : theme.border }]}
                onPress={() => { setModeIdx(i); setResult(null); setA(''); setB(''); setC(''); }}>
                <Text style={styles.chipIcon}>{m.icon}</Text>
                <Text style={[styles.chipLabel, { color: modeIdx === i ? '#FFF' : theme.text }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.desc, { color: theme.textSecondary }]}>{mode.desc}</Text>

          {modeIdx === 0 && (
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggleBtn, isDeg && { backgroundColor: COLOR }]} onPress={() => setIsDeg(true)}>
                <Text style={{ color: isDeg ? '#FFF' : theme.text, fontWeight: '700' }}>DEG</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, !isDeg && { backgroundColor: COLOR }]} onPress={() => setIsDeg(false)}>
                <Text style={{ color: !isDeg ? '#FFF' : theme.text, fontWeight: '700' }}>RAD</Text>
              </TouchableOpacity>
            </View>
          )}

          {placeholders.map((ph, i) => ph ? (
            <TextInput key={i}
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder={ph} placeholderTextColor={theme.textSecondary}
              value={[a, b, c][i]} onChangeText={[setA, setB, setC][i]}
              keyboardType="decimal-pad" />
          ) : null)}

          <TouchableOpacity style={[styles.runBtn, { backgroundColor: COLOR }]} onPress={calculate}>
            <Text style={styles.runBtnText}>▶ RUN COMPUTATION</Text>
          </TouchableOpacity>

          {result && (
            <View style={[styles.resultCard, { backgroundColor: COLOR }]}>
              <Text style={styles.resultLabel}>{mode.icon} {mode.label}</Text>
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
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  infoCard: { padding: 12, borderRadius: 10, marginBottom: 14 },
  infoText: { fontSize: 13, color: '#6A1B9A', lineHeight: 19 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipIcon: { fontSize: 14 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  desc: { fontSize: 12, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggleBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, backgroundColor: '#E0E0E0' },
  input: { padding: 14, borderRadius: 12, fontSize: 16, fontWeight: '600', borderWidth: 1, marginBottom: 10 },
  runBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  runBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  resultCard: { borderRadius: 14, padding: 18 },
  resultLabel: { color: '#CE93D8', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  resultLine: { color: '#FFF', fontSize: 14, lineHeight: 22 },
  resultMain: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 8, marginBottom: 8 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});