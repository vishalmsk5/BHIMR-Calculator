import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Share, Clipboard,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = [
  {
    name: 'Length', icon: '📏',
    units: ['Meter (m)', 'Kilometer (km)', 'Centimeter (cm)', 'Millimeter (mm)',
      'Inch (in)', 'Foot (ft)', 'Yard (yd)', 'Mile (mi)'],
    toBase: [1, 1000, 0.01, 0.001, 0.0254, 0.3048, 0.9144, 1609.344],
  },
  {
    name: 'Area', icon: '⬜',
    units: ['Sq Meter (m²)', 'Sq Foot (ft²)', 'Sq Inch (in²)', 'Acre', 'Hectare', 'Sq Km'],
    toBase: [1, 0.092903, 0.00064516, 4046.86, 10000, 1000000],
  },
  {
    name: 'Weight', icon: '⚖️',
    units: ['Kilogram (kg)', 'Gram (g)', 'Pound (lb)', 'Ounce (oz)', 'Tonne (t)', 'Milligram (mg)'],
    toBase: [1, 0.001, 0.453592, 0.0283495, 1000, 0.000001],
  },
  {
    name: 'Temperature', icon: '🌡️',
    units: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'],
    toBase: [], // special handling
  },
  {
    name: 'Volume', icon: '🧊',
    units: ['Liter (L)', 'Milliliter (mL)', 'Cubic Meter (m³)', 'Gallon (gal)', 'Fluid Oz'],
    toBase: [1, 0.001, 1000, 3.78541, 0.0295735],
  },
  {
    name: 'Speed', icon: '💨',
    units: ['m/s', 'km/h', 'mph', 'knot', 'ft/s'],
    toBase: [1, 0.277778, 0.44704, 0.514444, 0.3048],
  },
];

function convertTemp(val: number, from: string, to: string): number {
  let celsius = val;
  if (from.includes('°F')) celsius = (val - 32) * 5 / 9;
  else if (from.includes('K')) celsius = val - 273.15;
  if (to.includes('°C')) return celsius;
  if (to.includes('°F')) return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

export default function UnitConverterScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const [catIdx, setCatIdx] = useState(0);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState('');
  const [lastNote, setLastNote] = useState('');

  const cat = CATEGORIES[catIdx];

  const convert = () => {
    const num = parseFloat(inputVal);
    if (isNaN(num)) { setResult('Enter a valid number'); return; }
    let res: number;
    if (cat.name === 'Temperature') {
      res = convertTemp(num, cat.units[fromIdx], cat.units[toIdx]);
    } else {
      const base = num * cat.toBase[fromIdx];
      res = base / cat.toBase[toIdx];
    }
    const r = parseFloat(res.toPrecision(8)).toString();
    setResult(r);
    const note = `${num} ${cat.units[fromIdx]} = ${r} ${cat.units[toIdx]}`;
    setLastNote(note);
  };

  const copyResult = () => {
    if (result) Clipboard.setString(result);
  };

  const saveToNotes = async () => {
    if (!lastNote) return;
    try {
      const stored = await AsyncStorage.getItem('@bhim_calculation_notes');
      const notes = stored ? JSON.parse(stored) : [];
      notes.unshift({ id: Date.now().toString(), text: lastNote, timestamp: Date.now() });
      await AsyncStorage.setItem('@bhim_calculation_notes', JSON.stringify(notes.slice(0, 100)));
      alert('Saved to Calculation Notes!');
    } catch {}
  };

  return (
    <>
      <Stack.Screen options={{
        title: '⇄ Unit & Dimensions',
        headerStyle: { backgroundColor: '#1565C0' },
        headerTintColor: '#FFF',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        ),
      }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>

          {/* Industry use case */}
          <View style={[styles.infoCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.infoText}>
              💡 <Text style={{ fontWeight: '700' }}>Real-World Use:</Text> Interior designers converting sq.ft → sq.meters, or engineers converting inches → mm precisely.
            </Text>
          </View>

          {/* Category selector */}
          <Text style={[styles.label, { color: theme.text }]}>Select Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.map((c, i) => (
              <TouchableOpacity
                key={c.name}
                style={[styles.catChip, {
                  backgroundColor: catIdx === i ? '#1565C0' : theme.surface,
                  borderColor: catIdx === i ? '#1565C0' : theme.border,
                }]}
                onPress={() => { setCatIdx(i); setFromIdx(0); setToIdx(1); setResult(''); }}
              >
                <Text style={styles.catIcon}>{c.icon}</Text>
                <Text style={[styles.catName, { color: catIdx === i ? '#FFF' : theme.text }]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* From / To selectors */}
          <View style={styles.unitRow}>
            <View style={styles.unitBlock}>
              <Text style={[styles.label, { color: theme.text }]}>From</Text>
              <ScrollView style={[styles.unitList, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                {cat.units.map((u, i) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitItem, fromIdx === i && { backgroundColor: '#1565C0' + '22' }]}
                    onPress={() => setFromIdx(i)}
                  >
                    <Text style={[styles.unitText, { color: fromIdx === i ? '#1565C0' : theme.text }]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.swapBtn, { backgroundColor: '#1565C0' }]}
              onPress={() => { const t = fromIdx; setFromIdx(toIdx); setToIdx(t); setResult(''); }}
            >
              <Ionicons name="swap-horizontal" size={20} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.unitBlock}>
              <Text style={[styles.label, { color: theme.text }]}>To</Text>
              <ScrollView style={[styles.unitList, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                {cat.units.map((u, i) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitItem, toIdx === i && { backgroundColor: '#1565C0' + '22' }]}
                    onPress={() => setToIdx(i)}
                  >
                    <Text style={[styles.unitText, { color: toIdx === i ? '#1565C0' : theme.text }]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Input */}
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            placeholder={`Enter value in ${cat.units[fromIdx]}`}
            placeholderTextColor={theme.textSecondary}
            value={inputVal}
            onChangeText={setInputVal}
            keyboardType="decimal-pad"
          />

          {/* Convert button */}
          <TouchableOpacity style={[styles.runBtn, { backgroundColor: '#1565C0' }]} onPress={convert}>
            <Text style={styles.runBtnText}>⇄ RUN CONVERSION</Text>
          </TouchableOpacity>

          {/* Result */}
          {result ? (
            <View style={[styles.resultCard, { backgroundColor: '#1565C0' }]}>
              <Text style={styles.resultLabel}>RESULT</Text>
              <Text style={styles.resultValue}>{result}</Text>
              <Text style={styles.resultUnit}>{cat.units[toIdx]}</Text>
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={copyResult}>
                  <Ionicons name="copy-outline" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>COPY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={saveToNotes}>
                  <Ionicons name="save-outline" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>SAVE TO NOTES</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  infoCard: { padding: 12, borderRadius: 10, marginBottom: 14 },
  infoText: { fontSize: 13, color: '#1565C0', lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  catScroll: { marginBottom: 14 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, marginRight: 8,
  },
  catIcon: { fontSize: 16 },
  catName: { fontSize: 13, fontWeight: '600' },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  unitBlock: { flex: 1 },
  unitList: { maxHeight: 160, borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  unitItem: { padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0' },
  unitText: { fontSize: 12 },
  swapBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  input: {
    padding: 14, borderRadius: 12, fontSize: 18, fontWeight: '600',
    borderWidth: 1, marginBottom: 12, textAlign: 'center',
  },
  runBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  runBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  resultCard: { borderRadius: 14, padding: 20, alignItems: 'center' },
  resultLabel: { color: '#90CAF9', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  resultValue: { color: '#FFF', fontSize: 36, fontWeight: '900', marginTop: 4 },
  resultUnit: { color: '#90CAF9', fontSize: 14, marginTop: 2, marginBottom: 14 },
  resultActions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});