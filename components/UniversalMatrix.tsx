import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';

const MATRIX_TOOLS = [
  {
    id: 'unit',
    icon: '⇄',
    ionicon: 'swap-horizontal',
    title: 'Unit &\nDimensions',
    subtitle: 'Convert ft↔m, kg↔lb...',
    route: '/matrix/unit',
    color: '#1565C0',
    badge: 'Engineering',
  },
  {
    id: 'growth',
    icon: '%',
    ionicon: 'trending-up',
    title: 'Growth &\nWastage',
    subtitle: 'Profit %, Compound...',
    route: '/matrix/growth',
    color: '#2E7D32',
    badge: 'Finance',
  },
  {
    id: 'trig',
    icon: 'f(x)',
    ionicon: 'git-branch',
    title: 'Trigonometry\n& Vectors',
    subtitle: 'sin, cos, tan, angles...',
    route: '/matrix/trig',
    color: '#6A1B9A',
    badge: 'Science',
  },
  {
    id: 'scale',
    icon: 'A:B',
    ionicon: 'resize',
    title: 'Scale &\nProportions',
    subtitle: 'Ratios, mixtures...',
    route: '/matrix/scale',
    color: '#E65100',
    badge: 'Civil',
  },
  {
    id: 'exponents',
    icon: 'xʸ',
    ionicon: 'flash',
    title: 'Exponents\n& Roots',
    subtitle: '2^10, √, compound...',
    route: '/matrix/exponents',
    color: '#00695C',
    badge: 'Tech',
  },
  {
    id: 'stats',
    icon: 'x̄',
    ionicon: 'stats-chart',
    title: 'Stats &\nTolerance',
    subtitle: 'Mean, SD, variance...',
    route: '/matrix/stats',
    color: '#C62828',
    badge: 'QC',
  },
];

export const UniversalMatrix: React.FC = () => {
  const { theme } = useThemeStore();
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="grid" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Universal Matrix Dashboard
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Professional-grade calculation engines
        </Text>
      </View>

      {/* 6-grid */}
      <View style={styles.grid}>
        {MATRIX_TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(tool.route as any)}
            activeOpacity={0.75}
          >
            {/* Top color bar */}
            <View style={[styles.colorBar, { backgroundColor: tool.color }]} />

            {/* Icon area */}
            <View style={[styles.iconCircle, { backgroundColor: tool.color + '18' }]}>
              <Text style={[styles.iconText, { color: tool.color }]}>{tool.icon}</Text>
            </View>

            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: tool.color + '22' }]}>
              <Text style={[styles.badgeText, { color: tool.color }]}>{tool.badge}</Text>
            </View>

            {/* Title */}
            <Text style={[styles.cardTitle, { color: theme.text }]}>{tool.title}</Text>

            {/* Subtitle */}
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              {tool.subtitle}
            </Text>

            {/* Arrow */}
            <View style={styles.arrowRow}>
              <Ionicons name="arrow-forward-circle" size={18} color={tool.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 24 },
  sectionHeader: { marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { fontSize: 12 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  card: {
    width: '47.5%', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4,
    paddingBottom: 12,
  },
  colorBar: { height: 4, width: '100%' },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    margin: 10, marginBottom: 6,
  },
  iconText: { fontSize: 16, fontWeight: '900' },
  badge: {
    alignSelf: 'flex-start', marginHorizontal: 10,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, marginBottom: 4,
  },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  cardTitle: { fontSize: 13, fontWeight: '700', paddingHorizontal: 10, lineHeight: 18 },
  cardSubtitle: { fontSize: 10, paddingHorizontal: 10, marginTop: 3, lineHeight: 14 },
  arrowRow: { paddingHorizontal: 10, marginTop: 6 },
});