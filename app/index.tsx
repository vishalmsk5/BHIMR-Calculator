import React, { useState, useEffect, useRef } from 'react';
import { UniversalMatrix } from '../components/UniversalMatrix';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Switch, TouchableOpacity, Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { useThemeStore } from '../store/useThemeStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { themes, ThemeName } from '../constants/themes';
import { CalculationNotes } from '../components/QuoteOfDay';
import { BasicCalculator } from '../components/BasicCalculator';
import { ScientificCalculator } from '../components/ScientificCalculator';
import { LanguageScroller } from '../components/LanguageScroller';
import { t } from '../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BannerAd, BannerAdSize, InterstitialAd, AdEventType, TestIds,
} from 'react-native-google-mobile-ads';

const FLAG_GREEN = '#138808';

export default function Index() {
  const interstitialUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : 'ca-app-pub-4355119717560830/9771091574';

  // ✅ FIX: useRef madhye wrap - pratyeka render la nava object bannar nahi
  const interstitialRef = useRef(
    InterstitialAd.createForAdRequest(interstitialUnitId, {
      requestNonPersonalizedAdsOnly: true,
    })
  );

  useEffect(() => {
    const showAdOnceADay = async () => {
      try {
        const today = new Date().toDateString();
        const lastAdDate = await AsyncStorage.getItem('LAST_AD_DATE');
        if (lastAdDate !== today) {
          const unsubscribeLoaded = interstitialRef.current.addAdEventListener(
            AdEventType.LOADED, () => {
              interstitialRef.current.show();
              AsyncStorage.setItem('LAST_AD_DATE', today);
            }
          );
          interstitialRef.current.load();
          return () => unsubscribeLoaded();
        }
      } catch (e) {
        console.log('Ad error:', e); // ✅ crash honar nahi
      }
    };
    showAdOnceADay();
  }, []);

  const router = useRouter();
  const { theme, themeName, setTheme } = useThemeStore();
  const { language } = useLanguageStore();
  const {
    soundEnabled, hapticEnabled, jaiBlimGreeting, showAmbedkarWatermark,
    setSoundEnabled, setHapticEnabled, setJaiBlimGreeting,
    setShowAmbedkarWatermark, loadSettings,
  } = useSettingsStore();

  const [mode, setMode] = useState<'basic' | 'scientific'>('basic');

  useEffect(() => { loadSettings(); }, []);

  useEffect(() => {
    if (jaiBlimGreeting) {
      Speech.speak('Welcome to Bhim Universal Calculator', {
        language: 'en-IN', pitch: 1.0, rate: 0.9,
      });
    }
  }, [jaiBlimGreeting]);

  const handleToggle = async (
    toggleFn: (value: boolean) => Promise<void>,
    currentValue: boolean
  ) => {
    if (hapticEnabled) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFn(!currentValue);
  };

  // Theme display names - translated
  const getThemeName = (name: ThemeName): string => {
    switch (name) {
      case 'deepBlue': return t('deepBlue', language);
      case 'constitutionGold': return t('constitutionGold', language);
      case 'nightMode': return t('nightMode', language);
      case 'gradientGlow': return t('gradientGlow', language);
      default: return name;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {showAmbedkarWatermark && (
          <View style={styles.watermarkContainer}>
            <Ionicons name="person" size={200} color={theme.textSecondary} style={styles.watermarkIcon} />
            <Text style={[styles.watermarkText, { color: theme.textSecondary }]}>Dr. B.R. Ambedkar</Text>
          </View>
        )}

        <ScrollView style={styles.scrollView}>

          {/* ── HEADER ── */}
          <View style={styles.headerOrange}>
            <View style={styles.headerContent}>
              <Ionicons name="calculator" size={34} color="#FF6F00" style={styles.headerIcon3d} />
              <Text style={styles.title3d}>{t('appName', language)}</Text>
            </View>
            <Text style={styles.subtitle3d}>{t('appSubtitle', language)}</Text>
          </View>

          {/* ── QUOTE ── */}
          <View style={styles.quoteSection}>
            <CalculationNotes />
          </View>

          {/* ── MODE SWITCHER ── */}
          <View style={styles.modeSwitcher}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                { borderColor: mode === 'basic' ? FLAG_GREEN : theme.border },
                mode === 'basic' && { backgroundColor: FLAG_GREEN },
              ]}
              onPress={() => setMode('basic')}
            >
              <Text style={[styles.modeButtonText, { color: mode === 'basic' ? '#FFFFFF' : theme.text }]}>
                {t('basic', language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                { borderColor: mode === 'scientific' ? FLAG_GREEN : theme.border },
                mode === 'scientific' && { backgroundColor: FLAG_GREEN },
              ]}
              onPress={() => setMode('scientific')}
            >
              <Text style={[styles.modeButtonText, { color: mode === 'scientific' ? '#FFFFFF' : theme.text }]}>
                {t('scientific', language)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── LANGUAGE SCROLLER ── */}
          <LanguageScroller />

          {/* ── CALCULATOR ── */}
          <View style={styles.calculatorSection}>
            {mode === 'basic' ? <BasicCalculator /> : <ScientificCalculator />}
          </View>

          {/* ── QUICK ACCESS ── */}
          <View style={styles.quickAccess}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('quickAccess', language)}
            </Text>
            <View style={styles.quickAccessGrid}>
              <TouchableOpacity
                style={[styles.quickAccessCard, { backgroundColor: theme.surface }]}
                onPress={() => router.push('/voice')}
              >
                <Ionicons name="mic" size={32} color={theme.primary} />
                <Text style={[styles.quickAccessText, { color: theme.text }]}>
                  {t('aiVoice', language)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAccessCard, { backgroundColor: theme.surface }]}
                onPress={() => router.push('/business')}
              >
                <Ionicons name="briefcase" size={32} color={theme.primary} />
                <Text style={[styles.quickAccessText, { color: theme.text }]}>
                  {t('businessTools', language)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAccessCard, { backgroundColor: theme.surface }]}
                onPress={() => router.push('/explore')}
              >
                <Ionicons name="apps" size={32} color={theme.primary} />
                <Text style={[styles.quickAccessText, { color: theme.text }]}>
                  {t('explore', language)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAccessCard, { backgroundColor: theme.surface }]}
                onPress={() => router.push('/settings')}
              >
                <Ionicons name="settings" size={32} color={theme.textSecondary} />
                <Text style={[styles.quickAccessText, { color: theme.text }]}>
                  {t('settings', language)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── THEME SELECTOR ── */}
          <View style={styles.themeSelector}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('chooseTheme', language)}
            </Text>
            <View style={styles.themeGrid}>
              {(Object.keys(themes) as ThemeName[]).map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.themeCard,
                    { backgroundColor: themes[name].primary },
                    themeName === name && styles.selectedTheme,
                  ]}
                  onPress={() => setTheme(name)}
                >
                  <Text style={styles.themeName}>{getThemeName(name)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── QUICK SETTINGS ── */}
          <View style={[styles.settingsPreview, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('quickSettings', language)}
            </Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {t('soundFeedback', language)}
              </Text>
              <Switch
                value={soundEnabled}
                onValueChange={() => handleToggle(setSoundEnabled, soundEnabled)}
                trackColor={{ false: theme.border, true: FLAG_GREEN }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {t('hapticFeedback', language)}
              </Text>
              <Switch
                value={hapticEnabled}
                onValueChange={() => handleToggle(setHapticEnabled, hapticEnabled)}
                trackColor={{ false: theme.border, true: FLAG_GREEN }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {t('welcomeGreeting', language)}
              </Text>
              <Switch
                value={jaiBlimGreeting}
                onValueChange={() => handleToggle(setJaiBlimGreeting, jaiBlimGreeting)}
                trackColor={{ false: theme.border, true: FLAG_GREEN }}
              />
            </View>
          </View>

            {/* ── UNIVERSAL MATRIX ── */}
          <UniversalMatrix />
          
          {/* ── AD BANNER ── */}
          {Platform.OS !== 'web' && (
            <View style={{ alignItems: 'center', marginVertical: 15 }}>
              <BannerAd
                unitId={'ca-app-pub-4355119717560830/2219904613'}
                size={BannerAdSize.BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              />
            </View>
          )}

          {/* ── FOOTER ── */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {t('educateAgitateOrganize', language)}
            </Text>
            <Text style={[styles.footerSubtext, { color: theme.textSecondary }]}>
              {t('freeForeever', language)}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  headerOrange: {
    padding: 24, paddingTop: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    backgroundColor: '#E65100',
    shadowColor: '#FF6F00', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 12, elevation: 14,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  headerIcon3d: {
    textShadowColor: '#BF360C', textShadowOffset: { width: 2, height: 3 }, textShadowRadius: 4,
  },
  title3d: {
    fontSize: 18, fontWeight: 'bold', color: '#FFE0B2', flex: 1,
    textShadowColor: '#BF360C', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 3,
  },
  subtitle3d: {
    fontSize: 13, color: '#FFCC80', fontStyle: 'italic',
    textShadowColor: '#BF360C', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
  },
  quoteSection: { paddingHorizontal: 16 },
  modeSwitcher: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 12, gap: 12 },
  modeButton: {
    flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 2,
    shadowColor: '#138808', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
  },
  modeButtonText: { fontSize: 15, fontWeight: '700' },
  calculatorSection: { minHeight: 500, marginBottom: 24 },
  quickAccess: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickAccessCard: {
    width: '47%', padding: 20, borderRadius: 16, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  quickAccessText: { marginTop: 8, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  themeSelector: { paddingHorizontal: 16, marginBottom: 24 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeCard: {
    width: '47%', padding: 16, borderRadius: 12, alignItems: 'center',
    borderWidth: 3, borderColor: 'transparent',
  },
  selectedTheme: { borderColor: '#FFC107' },
  themeName: { color: '#FFFFFF', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  settingsPreview: { marginHorizontal: 16, padding: 16, borderRadius: 16, marginBottom: 24 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
  },
  settingLabel: { fontSize: 15, flex: 1, marginRight: 8 },
  footer: { padding: 24, alignItems: 'center' },
  footerText: { fontSize: 15, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  footerSubtext: { fontSize: 12, textAlign: 'center' },
  watermarkContainer: {
    position: 'absolute', top: '30%', left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center', opacity: 0.08, zIndex: 0,
  },
  watermarkIcon: { opacity: 0.5 },
  watermarkText: { fontSize: 24, fontWeight: 'bold', marginTop: 16, opacity: 0.7 },
});