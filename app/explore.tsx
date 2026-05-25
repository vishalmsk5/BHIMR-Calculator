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

type MiniCalculator = {
  id: string;
  icon: string;
  title: string;
  route: string;
  color: string;
};

export default function ExplorePage() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const miniCalculators: MiniCalculator[] = [
    { id: 'emi', icon: 'card', title: 'EMI Calculator', route: '/mini/emi', color: '#4CAF50' },
    { id: 'gst', icon: 'calculator', title: 'GST Calculator', route: '/mini/gst', color: '#2196F3' },
    { id: 'currency', icon: 'cash', title: 'Currency Converter', route: '/mini/currency', color: '#FF9800' },
    { id: 'discount', icon: 'pricetag', title: 'Discount Calculator', route: '/mini/discount', color: '#E91E63' },
    { id: 'unit', icon: 'swap-horizontal', title: 'Unit Converter', route: '/mini/unit', color: '#9C27B0' },
    { id: 'electricity', icon: 'flash', title: 'Electricity Bill', route: '/mini/electricity', color: '#FFC107' },
    { id: 'mileage', icon: 'car', title: 'Mileage Tracker', route: '/mini/mileage', color: '#00BCD4' },
    { id: 'speed', icon: 'speedometer', title: 'Internet Speed Cost', route: '/mini/speed', color: '#673AB7' },
    { id: 'construction', icon: 'hammer', title: 'Construction Materials', route: '/mini/construction', color: '#795548' },
    { id: 'recipe', icon: 'restaurant', title: 'Recipe Calculator', route: '/mini/recipe', color: '#FF5722' },
    { id: 'geometry', icon: 'square', title: 'Geometry Helper', route: '/mini/geometry', color: '#3F51B5' },
    { id: 'split', icon: 'people', title: 'Expense Splitter', route: '/mini/split', color: '#009688' },
    { id: 'timezone', icon: 'time', title: 'Time Zone Converter', route: '/mini/timezone', color: '#607D8B' },
    { id: 'battery', icon: 'battery-charging', title: 'Battery Cost', route: '/mini/battery', color: '#8BC34A' },
    { id: 'pomodoro', icon: 'timer', title: 'Study Timer', route: '/mini/pomodoro', color: '#F44336' },
    { id: 'workshop', icon: 'construct', title: 'Workshop Helper', route: '/mini/workshop', color: '#FF6F00' },
    { id: 'bmi', icon: 'fitness', title: 'BMI Calculator', route: '/mini/bmi', color: '#4CAF50' },
    { id: 'water', icon: 'water', title: 'Water Tank Volume', route: '/mini/water', color: '#2196F3' },
    { id: 'paint', icon: 'color-palette', title: 'Paint Estimator', route: '/mini/paint', color: '#9C27B0' },
    { id: 'comfort', icon: 'thermometer', title: 'Room Comfort Index', route: '/mini/comfort', color: '#FF5722' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Explore Calculators',
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
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            20+ specialized calculators for everyday needs
          </Text>

          <View style={styles.grid}>
            {miniCalculators.map((calc) => (
              <TouchableOpacity
                key={calc.id}
                style={[styles.calcCard, { backgroundColor: theme.surface }]}
                onPress={() => router.push(calc.route as any)}
              >
                <View style={[styles.iconContainer, { backgroundColor: calc.color }]}>
                  <Ionicons name={calc.icon as any} size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.calcTitle, { color: theme.text }]} numberOfLines={2}>
                  {calc.title}
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
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  calcCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 120,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  calcTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
