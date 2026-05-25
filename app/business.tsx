import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';

// Tool card type
interface BusinessTool {
  id: string;
  icon: string;
  title: string;
  route: string;
  cardBg: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  border?: string;
}

export default function BusinessPage() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const businessTools: BusinessTool[] = [
    // Row 1 - Orange/Kesari
    {
      id: 'emi',
      icon: 'card',
      title: 'EMI Calculator',
      route: '/mini/emi',
      cardBg: '#FFF3E0',
      iconBg: '#E65100',
      iconColor: '#FFFFFF',
      textColor: '#BF360C',
    },
    {
      id: 'gst',
      icon: 'calculator',
      title: 'GST Calculator',
      route: '/mini/gst',
      cardBg: '#FFF3E0',
      iconBg: '#E65100',
      iconColor: '#FFFFFF',
      textColor: '#BF360C',
    },
    // Row 2 - White + Blue Border
    {
      id: 'currency',
      icon: 'cash',
      title: 'Currency Converter',
      route: '/mini/currency',
      cardBg: '#FFFFFF',
      iconBg: '#FFFFFF',
      iconColor: '#0D47A1',
      textColor: '#0D47A1',
      border: '#0D47A1',
    },
    {
      id: 'discount',
      icon: 'pricetag',
      title: 'Discount Calculator',
      route: '/mini/discount',
      cardBg: '#FFFFFF',
      iconBg: '#FFFFFF',
      iconColor: '#0D47A1',
      textColor: '#0D47A1',
      border: '#0D47A1',
    },
    // Row 3 - Green
    {
      id: 'profit',
      icon: 'trending-up',
      title: 'Profit/Loss',
      route: '/mini/profit',
      cardBg: '#E8F5E9',
      iconBg: '#2E7D32',
      iconColor: '#FFFFFF',
      textColor: '#1B5E20',
    },
    {
      id: 'split',
      icon: 'people',
      title: 'Expense Split',
      route: '/mini/split',
      cardBg: '#E8F5E9',
      iconBg: '#2E7D32',
      iconColor: '#FFFFFF',
      textColor: '#1B5E20',
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Business Tools',
          headerStyle: { backgroundColor: '#E65100' },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Professional tools for your business calculations
          </Text>

          <View style={styles.grid}>
            {businessTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolCard,
                  { backgroundColor: tool.cardBg },
                  tool.border
                    ? { borderWidth: 2, borderColor: tool.border }
                    : {},
                ]}
                onPress={() => router.push(tool.route as any)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: tool.iconBg,
                      borderWidth: tool.border ? 2 : 0,
                      borderColor: tool.border || 'transparent',
                    },
                  ]}
                >
                  <Ionicons name={tool.icon as any} size={32} color={tool.iconColor} />
                </View>
                <Text style={[styles.toolTitle, { color: tool.textColor }]}>
                  {tool.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});