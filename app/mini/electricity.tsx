// Template for other mini calculators - they all follow the same pattern
// Just copy this and customize for each specific calculator
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

export default function MiniCalculatorTemplate() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [value1, setValue1] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    // Add calculation logic here
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mini Calculator',
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
              <Text style={[styles.label, { color: theme.text }]}>Input Value</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="Enter value"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={value1}
                onChangeText={setValue1}
              />

              <TouchableOpacity
                style={[styles.calculateButton, { backgroundColor: theme.primary }]}
                onPress={calculate}
              >
                <Text style={styles.calculateButtonText}>Calculate</Text>
              </TouchableOpacity>
            </View>

            {result && (
              <View style={[styles.resultSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.resultTitle, { color: theme.primary }]}>Result</Text>
                <Text style={[styles.resultValue, { color: theme.text }]}>{result}</Text>
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
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
