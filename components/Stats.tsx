import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR = '#C62828';

export default function StatsScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{
    lines: string[]; main: string
  } | null>(null);

  const calculate = () => {
    try {
      const nums = input
        .split(/[,\n\s]+/)
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n));

      if (nums.length === 0) {
        setResult({ lines: ['Enter numbers separated by commas'], main: '' });
        return;
      }

      const n = nums.length;
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const sorted = [...nums].sort((a, b) => a - b);
      const median = n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];
      const variance = nums.reduce((acc, val) =>
        acc + Math.pow(val - mean, 2), 0) / n;
      const sd = Math.sqrt(variance);
      const min = sorted[0];
      const max = sorted[n - 1];
      const range = max - min;
      const fmt = (v: number) => parseFloat(v.toPrecision(8)).toString();

      setResult({
        lines: [
          `Count: ${n}`,
          `Sum: ${fmt(sum)}`,
          `Mean (Average): ${fmt(mean)}`,
          `Median: ${fmt(median)}`,
          `Std Deviation: ${fmt(sd)}`,
          `Variance: ${fmt(variance)}`,
          `Min: ${fmt(min)}`,
          `Max: ${fmt(max)}`,
          `Range: ${fmt(range)}`,
        ],
        main: fmt(mean),
      });
    } catch {
      setResult({ lines: ['Invalid input'], main: '' });
    }
  };

  const saveToNotes = async () => {
    if (!result) return;
    try {
      const text = `[Stats & Tolerance]\n` + result.lines.join('\n');
      const stored = await AsyncStorage.getItem('@bhim_calculation_notes');
      const notes = stored ? JSON.parse(stored) : [];
      notes.unshift({ id: Date.now().toString(), text, timestamp: Date.now() });
      await AsyncStorage.setItem(
        '@bhim_calculation_notes',
        JSON.stringify(notes.slice(0, 100))
      );
      alert('Saved to Notes!');
    } catch {}
  };

  return (
    <>
      <Stack.Screen options={{
        title: 'x̄ Stats & Tolerance',
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
          <View style={[styles.infoCard, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[styles.infoText, { color: COLOR }]}>
              💡 <Text style={{ fontWeight: '700' }}>Industry Use:</Text> Quality
              control engineers checking batch tolerances, teachers computing
              class statistics, researchers analyzing data sets.
            </Text>
          </View>
          <Text style={[styles.label, { color: theme.text }]}>
            Enter Numbers (comma or newline separated)
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            }]}
            placeholder="e.g. 10, 20, 30, 40, 50"
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.runBtn, { backgroundColor: COLOR }]}
            onPress={calculate}
          >
            <Text style={styles.runBtnText}>▶ CALCULATE STATISTICS</Text>
          </TouchableOpacity>
          {result && (
            <View style={[styles.resultCard, { backgroundColor: COLOR }]}>
              <Text style={styles.resultLabel}>📊 Statistics Result</Text>
              {result.lines.map((line, i) => (
                <Text key={i} style={styles.resultLine}>{line}</Text>
              ))}
              {result.main ? (
                <Text style={styles.resultMain}>{result.main}</Text>
              ) : null}
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => result.main && Clipboard.setString(result.main)}
                >
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
  infoText: { fontSize: 13, lineHeight: 19 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    padding: 14, borderRadius: 12, fontSize: 15,
    borderWidth: 1, marginBottom: 14,
    minHeight: 100, textAlignVertical: 'top',
  },
  runBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  runBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  resultCard: { borderRadius: 14, padding: 18 },
  resultLabel: { color: '#FFCDD2', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  resultLine: { color: '#FFF', fontSize: 14, lineHeight: 24 },
  resultMain: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 8, marginBottom: 8 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});