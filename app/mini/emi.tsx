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

export default function EMICalculator() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [emi, setEmi] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100;
    const months = parseFloat(tenure) * 12;

    if (principal && rate && months) {
      const emiValue = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      const totalPay = emiValue * months;
      const totalInt = totalPay - principal;

      setEmi(emiValue);
      setTotalPayment(totalPay);
      setTotalInterest(totalInt);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'EMI Calculator',
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
              <Text style={[styles.label, { color: theme.text }]}>Loan Amount (₹)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 500000"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={loanAmount}
                onChangeText={setLoanAmount}
              />

              <Text style={[styles.label, { color: theme.text }]}>Interest Rate (% per year)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 8.5"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={interestRate}
                onChangeText={setInterestRate}
              />

              <Text style={[styles.label, { color: theme.text }]}>Tenure (years)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 20"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={tenure}
                onChangeText={setTenure}
              />

              <TouchableOpacity
                style={[styles.calculateButton, { backgroundColor: theme.primary }]}
                onPress={calculateEMI}
              >
                <Text style={styles.calculateButtonText}>Calculate EMI</Text>
              </TouchableOpacity>
            </View>

            {emi !== null && (
              <View style={[styles.resultSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.resultTitle, { color: theme.primary }]}>Results</Text>
                
                <View style={[styles.resultCard, { backgroundColor: theme.primary }]}>
                  <Text style={styles.resultLabel}>Monthly EMI</Text>
                  <Text style={styles.resultValue}>₹ {emi.toFixed(2)}</Text>
                </View>

                <View style={styles.resultRow}>
                  <View style={styles.resultItem}>
                    <Text style={[styles.resultItemLabel, { color: theme.textSecondary }]}>
                      Total Payment
                    </Text>
                    <Text style={[styles.resultItemValue, { color: theme.text }]}>
                      ₹ {totalPayment?.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.resultItem}>
                    <Text style={[styles.resultItemLabel, { color: theme.textSecondary }]}>
                      Total Interest
                    </Text>
                    <Text style={[styles.resultItemValue, { color: theme.text }]}>
                      ₹ {totalInterest?.toFixed(2)}
                    </Text>
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
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  resultValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resultItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  resultItemLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
