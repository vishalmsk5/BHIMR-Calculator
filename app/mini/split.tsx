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

export default function ExpenseSplit() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [totalAmount, setTotalAmount] = useState('');
  const [numPeople, setNumPeople] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateSplit = () => {
    const amount = parseFloat(totalAmount);
    const people = parseInt(numPeople);

    if (amount && people > 0) {
      const perPerson = amount / people;
      setResult({
        total: amount.toFixed(2),
        people,
        perPerson: perPerson.toFixed(2),
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Expense Splitter',
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
              <Text style={[styles.label, { color: theme.text }]}>Total Amount (₹)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 5000"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={totalAmount}
                onChangeText={setTotalAmount}
              />

              <Text style={[styles.label, { color: theme.text }]}>Number of People</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 4"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={numPeople}
                onChangeText={setNumPeople}
              />

              <View style={styles.quickPeople}>
                {['2', '3', '4', '5', '6', '8'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.quickButton,
                      numPeople === num && { backgroundColor: theme.primary },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => setNumPeople(num)}
                  >
                    <Text
                      style={{
                        color: numPeople === num ? '#FFFFFF' : theme.text,
                        fontWeight: '600',
                      }}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.calculateButton, { backgroundColor: theme.primary }]}
                onPress={calculateSplit}
              >
                <Text style={styles.calculateButtonText}>Calculate Split</Text>
              </TouchableOpacity>
            </View>

            {result && (
              <View style={[styles.resultSection, { backgroundColor: theme.primary }]}>
                <Ionicons name="people" size={48} color="#FFFFFF" />
                <Text style={styles.resultLabel}>Each Person Pays</Text>
                <Text style={styles.resultValue}>₹ {result.perPerson}</Text>
                <Text style={styles.resultSubtext}>
                  Total: ₹{result.total} ÷ {result.people} people
                </Text>
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
  quickPeople: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  quickButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
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
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  resultLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  resultValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  resultSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
});
