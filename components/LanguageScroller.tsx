import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { t } from '../constants/translations';

const ALL_LANGUAGES = [
  { code: 'en',    nativeName: 'English',       flag: '🇬🇧', voiceCode: 'en-IN',  sample: '1, 2, 3' },
  { code: 'en-IN', nativeName: 'English (IN)',  flag: '🇮🇳', voiceCode: 'en-IN',  sample: '1, 2, 3' },
  { code: 'hi',    nativeName: 'हिन्दी',          flag: '🇮🇳', voiceCode: 'hi-IN',  sample: '१, २, ३' },
  { code: 'mr',    nativeName: 'मराठी',           flag: '🧡', voiceCode: 'mr-IN',  sample: '१, २, ३' },
  { code: 'ta',    nativeName: 'தமிழ்',           flag: '🇮🇳', voiceCode: 'ta-IN',  sample: '1, 2, 3' },
  { code: 'te',    nativeName: 'తెలుగు',           flag: '🇮🇳', voiceCode: 'te-IN',  sample: '1, 2, 3' },
  { code: 'gu',    nativeName: 'ગુજરાતી',          flag: '🇮🇳', voiceCode: 'gu-IN',  sample: '૧, ૨, ૩' },
  { code: 'ml',    nativeName: 'മലയാളം',           flag: '🇮🇳', voiceCode: 'ml-IN',  sample: '1, 2, 3' },
  { code: 'bn',    nativeName: 'বাংলা',            flag: '🇧🇩', voiceCode: 'bn-IN',  sample: '১, ২, ৩' },
  { code: 'kn',    nativeName: 'ಕನ್ನಡ',            flag: '🇮🇳', voiceCode: 'kn-IN',  sample: '1, 2, 3' },
  { code: 'pa',    nativeName: 'ਪੰਜਾਬੀ',           flag: '🇮🇳', voiceCode: 'pa-IN',  sample: '1, 2, 3' },
  { code: 'ar',    nativeName: 'العربية',           flag: '🇸🇦', voiceCode: 'ar-SA',  sample: '١, ٢, ٣' },
  { code: 'fr',    nativeName: 'Français',         flag: '🇫🇷', voiceCode: 'fr-FR',  sample: '1, 2, 3' },
  { code: 'de',    nativeName: 'Deutsch',          flag: '🇩🇪', voiceCode: 'de-DE',  sample: '1, 2, 3' },
  { code: 'es',    nativeName: 'Español',          flag: '🇪🇸', voiceCode: 'es-ES',  sample: '1, 2, 3' },
  { code: 'it',    nativeName: 'Italiano',         flag: '🇮🇹', voiceCode: 'it-IT',  sample: '1, 2, 3' },
  { code: 'ru',    nativeName: 'Русский',          flag: '🇷🇺', voiceCode: 'ru-RU',  sample: '1, 2, 3' },
];

interface Props {
  onLanguageChange?: (voiceCode: string) => void;
}

export const LanguageScroller: React.FC<Props> = ({ onLanguageChange }) => {
  const { theme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const [showAllModal, setShowAllModal] = useState(false);

  const currentLang = ALL_LANGUAGES.find(l => l.code === language) || ALL_LANGUAGES[0];

  const handleSelect = (lang: typeof ALL_LANGUAGES[0]) => {
    setLanguage(lang.code as any);
    if (onLanguageChange) onLanguageChange(lang.voiceCode);
    setShowAllModal(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* Label row */}
      <View style={styles.labelRow}>
        <Ionicons name="language-outline" size={16} color={theme.primary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {t('displayLanguage', language)}
        </Text>
        <TouchableOpacity
          style={[styles.allBtn, { borderColor: theme.primary }]}
          onPress={() => setShowAllModal(true)}
        >
          <Text style={[styles.allBtnText, { color: theme.primary }]}>
            {t('allLanguages', language)} {ALL_LANGUAGES.length} →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal scroll chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {ALL_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => handleSelect(lang)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipFlag}>{lang.flag}</Text>
              <Text
                style={[styles.chipName, { color: isSelected ? '#FFFFFF' : theme.text }]}
                numberOfLines={1}
              >
                {lang.nativeName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active language bar */}
      <View style={[styles.selectedBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={styles.selectedFlag}>{currentLang.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.selectedName, { color: theme.text }]}>{currentLang.nativeName}</Text>
          <Text style={[styles.selectedSample, { color: theme.textSecondary }]}>
            {t('numbers', language)}: {currentLang.sample}
          </Text>
        </View>
        <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.activeBadgeText}>{t('active', language)}</Text>
        </View>
      </View>

      {/* Full Modal */}
      <Modal
        visible={showAllModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  🌐 {t('displayLanguage', language)}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {ALL_LANGUAGES.length} {t('allLanguages', language).toLowerCase()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAllModal(false)}>
                <Ionicons name="close-circle" size={30} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={ALL_LANGUAGES}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item, index }) => {
                const isSelected = language === item.code;
                return (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      {
                        backgroundColor: isSelected ? theme.primary + '18' : theme.background,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 1.5 : 0.5,
                      },
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.numBadge, { backgroundColor: theme.border }]}>
                      <Text style={[styles.numText, { color: theme.textSecondary }]}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>
                    <Text style={styles.listFlag}>{item.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.listName, { color: isSelected ? theme.primary : theme.text }]}>
                        {item.nativeName}
                      </Text>
                      <Text style={[styles.listSample, { color: theme.textSecondary }]}>
                        {item.sample}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', flex: 1 },
  allBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  allBtnText: { fontSize: 12, fontWeight: '700' },
  scroll: { marginBottom: 8 },
  scrollContent: { gap: 8, paddingRight: 8, paddingBottom: 4 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, minWidth: 90,
  },
  chipFlag: { fontSize: 16 },
  chipName: { fontSize: 12, fontWeight: '600', maxWidth: 80 },
  selectedBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  selectedFlag: { fontSize: 22 },
  selectedName: { fontSize: 14, fontWeight: '700' },
  selectedSample: { fontSize: 11, marginTop: 1 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  activeBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '82%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 13, marginTop: 2 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, marginBottom: 7,
  },
  numBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  numText: { fontSize: 11, fontWeight: '700' },
  listFlag: { fontSize: 22 },
  listName: { fontSize: 15, fontWeight: '600' },
  listSample: { fontSize: 11, marginTop: 1 },
});