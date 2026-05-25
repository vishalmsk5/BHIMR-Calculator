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

export default function DiscountCalculator() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateDiscount = () => {
    const price = parseFloat(originalPrice);
    const discount = parseFloat(discountPercent);

    if (price && discount >= 0 && discount <= 100) {
      const discountAmount = (price * discount) / 100;
      const finalPrice = price - discountAmount;
      const savings = discountAmount;

      setResult({
        originalPrice: price.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        savings: savings.toFixed(2),
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Discount Calculator',
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
              <Text style={[styles.label, { color: theme.text }]}>Original Price (₹)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 5000"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={originalPrice}
                onChangeText={setOriginalPrice}
              />

              <Text style={[styles.label, { color: theme.text }]}>Discount (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 20"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={discountPercent}
                onChangeText={setDiscountPercent}
              />

              <View style={styles.quickDiscounts}>
                {['10', '20', '30', '50'].map((percent) => (
                  <TouchableOpacity
                    key={percent}
                    style={[styles.quickButton, { backgroundColor: theme.accent }]}
                    onPress={() => setDiscountPercent(percent)}
                  >
                    <Text style={styles.quickButtonText}>{percent}%</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.calculateButton, { backgroundColor: theme.primary }]}
                onPress={calculateDiscount}
              >
                <Text style={styles.calculateButtonText}>Calculate</Text>
              </TouchableOpacity>
            </View>

            {result && (
              <View style={[styles.resultSection, { backgroundColor: theme.surface }]}>
                <View style={[styles.priceCard, { backgroundColor: theme.primary }]}>
                  <Text style={styles.priceLabel}>Final Price</Text>
                  <Text style={styles.priceValue}>₹ {result.finalPrice}</Text>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Original
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      ₹ {result.originalPrice}
                    </Text>
                  </View>

                  <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      You Save
                    </Text>
                    <Text style={[styles.detailValue, { color: '#4CAF50' }]}>
                      ₹ {result.savings}
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
  quickDiscounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  quickButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  priceCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
