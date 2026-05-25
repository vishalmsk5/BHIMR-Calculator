import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/useThemeStore';

export default function BMICalculator() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convert cm to m

    if (w && h) {
      const bmi = w / (h * h);
      let category = '';
      let color = '';
      let advice = '';

      if (bmi < 18.5) {
        category = 'Underweight';
        color = '#2196F3';
        advice = 'Consider gaining weight through a balanced diet.';
      } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Normal';
        color = '#4CAF50';
        advice = 'Great! Maintain your healthy weight.';
      } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
        color = '#FF9800';
        advice = 'Consider light exercise and a balanced diet.';
      } else {
        category = 'Obese';
        color = '#F44336';
        advice = 'Consult a healthcare professional for guidance.';
      }

      setResult({
        bmi: bmi.toFixed(1),
        category,
        color,
        advice,
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'BMI Calculator',
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.inputSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.label, { color: theme.text }]}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 70"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />

              <Text style={[styles.label, { color: theme.text }]}>Height (cm)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 175"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />

              <TouchableOpacity
                style={[styles.calculateButton, { backgroundColor: theme.primary }]}
                onPress={calculateBMI}
              >
                <Text style={styles.calculateButtonText}>Calculate BMI</Text>
              </TouchableOpacity>
            </View>

            {result && (
              <View style={[styles.resultSection, { backgroundColor: theme.surface }]}>
                <View style={[styles.bmiCard, { backgroundColor: result.color }]}>
                  <Text style={styles.bmiLabel}>Your BMI</Text>
                  <Text style={styles.bmiValue}>{result.bmi}</Text>
                  <Text style={styles.categoryText}>{result.category}</Text>
                </View>

                <View style={styles.adviceCard}>
                  <Ionicons name="information-circle" size={24} color={theme.primary} />
                  <Text style={[styles.adviceText, { color: theme.text }]}>{result.advice}</Text>
                </View>

                <View style={styles.bmiScale}>
                  <Text style={[styles.scaleTitle, { color: theme.text }]}>BMI Scale</Text>
                  <View style={styles.scaleItem}>
                    <View style={[styles.scaleDot, { backgroundColor: '#2196F3' }]} />
                    <Text style={[styles.scaleText, { color: theme.text }]}>
                      Underweight: &lt; 18.5
                    </Text>
                  </View>
                  <View style={styles.scaleItem}>
                    <View style={[styles.scaleDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={[styles.scaleText, { color: theme.text }]}>
                      Normal: 18.5 - 24.9
                    </Text>
                  </View>
                  <View style={styles.scaleItem}>
                    <View style={[styles.scaleDot, { backgroundColor: '#FF9800' }]} />
                    <Text style={[styles.scaleText, { color: theme.text }]}>
                      Overweight: 25 - 29.9
                    </Text>
                  </View>
                  <View style={styles.scaleItem}>
                    <View style={[styles.scaleDot, { backgroundColor: '#F44336' }]} />
                    <Text style={[styles.scaleText, { color: theme.text }]}>Obese: ≥ 30</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  calculateButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultSection: {
    padding: 20,
    borderRadius: 16,
  },
  bmiCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  bmiLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  bmiValue: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: 'bold',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  adviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
    gap: 12,
  },
  adviceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bmiScale: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scaleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  scaleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  scaleText: {
    fontSize: 14,
  },
});
