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

export default function ProfitLossCalculator() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [result, setResult] = useState<any>(null);

  const calculateProfitLoss = () => {
    const cost = parseFloat(costPrice);
    const selling = parseFloat(sellingPrice);
    const qty = parseFloat(quantity) || 1;

    if (!cost || !selling || cost <= 0 || selling <= 0) {
      return;
    }

    const profitLossPerUnit = selling - cost;
    const totalCost = cost * qty;
    const totalRevenue = selling * qty;
    const totalProfitLoss = profitLossPerUnit * qty;
    const profitLossPercentage = ((profitLossPerUnit / cost) * 100);

    const isProfit = profitLossPerUnit >= 0;

    setResult({
      profitLossPerUnit: profitLossPerUnit.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      totalProfitLoss: totalProfitLoss.toFixed(2),
      profitLossPercentage: profitLossPercentage.toFixed(2),
      isProfit,
    });
  };

  const clearAll = () => {
    setCostPrice('');
    setSellingPrice('');
    setQuantity('1');
    setResult(null);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profit/Loss Calculator',
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
            {/* Input Section */}
            <View style={[styles.inputSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                Enter Details
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Cost Price (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  placeholder="e.g., 500"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={costPrice}
                  onChangeText={setCostPrice}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Selling Price (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  placeholder="e.g., 650"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Quantity</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  placeholder="e.g., 10"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.clearButton, { borderColor: theme.border }]}
                  onPress={clearAll}
                >
                  <Ionicons name="refresh" size={20} color={theme.text} />
                  <Text style={[styles.buttonText, { color: theme.text }]}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.calculateButton, { backgroundColor: theme.primary }]}
                  onPress={calculateProfitLoss}
                >
                  <Ionicons name="calculator" size={20} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Calculate</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Result Section */}
            {result && (
              <View style={[styles.resultSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                  Results
                </Text>

                {/* Main Result Card */}
                <View
                  style={[
                    styles.mainResultCard,
                    {
                      backgroundColor: result.isProfit ? '#4CAF50' : '#F44336',
                    },
                  ]}
                >
                  <Ionicons
                    name={result.isProfit ? 'trending-up' : 'trending-down'}
                    size={48}
                    color="#FFFFFF"
                  />
                  <Text style={styles.mainResultLabel}>
                    {result.isProfit ? 'PROFIT' : 'LOSS'}
                  </Text>
                  <Text style={styles.mainResultValue}>
                    ₹ {Math.abs(parseFloat(result.totalProfitLoss)).toFixed(2)}
                  </Text>
                  <Text style={styles.mainResultPercentage}>
                    {result.profitLossPercentage}% {result.isProfit ? 'Profit' : 'Loss'}
                  </Text>
                </View>

                {/* Details Grid */}
                <View style={styles.detailsGrid}>
                  <View style={[styles.detailCard, { backgroundColor: theme.background }]}>
                    <Ionicons name="cart" size={24} color={theme.primary} />
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Total Cost
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      ₹ {result.totalCost}
                    </Text>
                  </View>

                  <View style={[styles.detailCard, { backgroundColor: theme.background }]}>
                    <Ionicons name="cash" size={24} color={theme.accent} />
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Total Revenue
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      ₹ {result.totalRevenue}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={[styles.detailCard, { backgroundColor: theme.background }]}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Per Unit Cost
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      ₹ {costPrice}
                    </Text>
                  </View>

                  <View style={[styles.detailCard, { backgroundColor: theme.background }]}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Per Unit {result.isProfit ? 'Profit' : 'Loss'}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: result.isProfit ? '#4CAF50' : '#F44336' },
                      ]}
                    >
                      ₹ {Math.abs(parseFloat(result.profitLossPerUnit)).toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Margin Info */}
                <View style={[styles.marginCard, { backgroundColor: theme.background }]}>
                  <Ionicons name="information-circle" size={24} color={theme.primary} />
                  <View style={styles.marginContent}>
                    <Text style={[styles.marginTitle, { color: theme.text }]}>
                      {result.isProfit ? 'Profit Margin' : 'Loss Margin'}
                    </Text>
                    <Text style={[styles.marginText, { color: theme.textSecondary }]}>
                      {result.isProfit
                        ? `You are making ${result.profitLossPercentage}% profit on each unit sold.`
                        : `You are losing ${Math.abs(parseFloat(result.profitLossPercentage)).toFixed(2)}% on each unit sold.`}
                    </Text>
                  </View>
                </View>

                {/* Business Advice */}
                <View style={[styles.adviceCard, { backgroundColor: theme.primary }]}>
                  <Ionicons name="bulb" size={24} color="#FFC107" />
                  <View style={styles.adviceContent}>
                    <Text style={styles.adviceTitle}>Business Tip</Text>
                    <Text style={styles.adviceText}>
                      {result.isProfit
                        ? 'Great! Maintain quality and consider slight price optimization for better margins.'
                        : 'Warning: Review your cost structure or increase selling price to avoid losses.'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Example Section */}
            {!result && (
              <View style={[styles.exampleSection, { backgroundColor: theme.surface }]}>
                <Ionicons name="help-circle" size={24} color={theme.primary} />
                <View style={styles.exampleContent}>
                  <Text style={[styles.exampleTitle, { color: theme.text }]}>
                    Example Calculation
                  </Text>
                  <Text style={[styles.exampleText, { color: theme.textSecondary }]}>
                    Cost Price: ₹500{'\n'}
                    Selling Price: ₹650{'\n'}
                    Quantity: 10{'\n'}
                    {'\n'}
                    Result: ₹1,500 profit (30% margin)
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: {
    borderWidth: 1,
  },
  calculateButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  mainResultCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  mainResultLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  mainResultValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 8,
  },
  mainResultPercentage: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: 8,
    opacity: 0.9,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  marginCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  marginContent: {
    flex: 1,
  },
  marginTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  marginText: {
    fontSize: 14,
    lineHeight: 20,
  },
  adviceCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  adviceContent: {
    flex: 1,
  },
  adviceTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  adviceText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  exampleSection: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  exampleContent: {
    flex: 1,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
