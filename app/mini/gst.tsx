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

export default function GSTCalculator() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [originalPrice, setOriginalPrice] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [includeGST, setIncludeGST] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculateGST = () => {
    const price = parseFloat(originalPrice);
    const rate = parseFloat(gstRate) / 100;

    if (price && rate >= 0) {
      if (includeGST) {
        // Price includes GST, calculate base price
        const basePrice = price / (1 + rate);
        const gstAmount = price - basePrice;
        setResult({
          basePrice: basePrice.toFixed(2),
          gstAmount: gstAmount.toFixed(2),
          totalPrice: price.toFixed(2),
        });
      } else {
        // Price excludes GST, add GST
        const gstAmount = price * rate;
        const totalPrice = price + gstAmount;
        setResult({
          basePrice: price.toFixed(2),
          gstAmount: gstAmount.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
        });
      }
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'GST Calculator',
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
              <Text style={[styles.label, { color: theme.text }]}>Price (₹)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 1000"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={originalPrice}
                onChangeText={setOriginalPrice}
              />

              <Text style={[styles.label, { color: theme.text }]}>GST Rate (%)</Text>
              <View style={styles.gstRateButtons}>
                {['5', '12', '18', '28'].map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.rateButton,
                      gstRate === rate && { backgroundColor: theme.primary },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => setGstRate(rate)}
                  >
                    <Text
                      style={[{
                        color: gstRate === rate ? '#FFFFFF' : theme.text,
                        fontWeight: '600',
                      }]}
                    >
                      {rate}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="Custom rate"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={gstRate}
                onChangeText={setGstRate}
              />

              <View style={styles.toggleSection}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !includeGST && { backgroundColor: theme.primary },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => setIncludeGST(false)}
                >
                  <Text
                    style={[{
                      color: !includeGST ? '#FFFFFF' : theme.text,
                      fontWeight: '600',
                    }]}
                  >
                    Exclude GST
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    includeGST && { backgroundColor: theme.primary },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => setIncludeGST(true)}
                >
                  <Text
                    style={[{
                      color: includeGST ? '#FFFFFF' : theme.text,
                      fontWeight: '600',
                    }]}
                  >
                    Include GST
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.calculateButton, { backgroundColor: theme.primary }]}
                onPress={calculateGST}
              >
                <Text style={styles.calculateButtonText}>Calculate</Text>
              </TouchableOpacity>
            </View>

            {result && (
              <View style={[styles.resultSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.resultTitle, { color: theme.primary }]}>Results</Text>
                
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>
                    Base Price
                  </Text>
                  <Text style={[styles.resultValue, { color: theme.text }]}>
                    ₹ {result.basePrice}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>
                    GST Amount ({gstRate}%)
                  </Text>
                  <Text style={[styles.resultValue, { color: theme.accent }]}>
                    ₹ {result.gstAmount}
                  </Text>
                </View>

                <View style={[styles.resultItem, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.resultLabel, { color: '#FFFFFF' }]}>Total Price</Text>
                  <Text style={[styles.resultValue, { color: '#FFFFFF', fontSize: 28 }]}>
                    ₹ {result.totalPrice}
                  </Text>
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
    marginBottom: 12,
  },
  gstRateButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  rateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
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
    padding: 20,
    borderRadius: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
