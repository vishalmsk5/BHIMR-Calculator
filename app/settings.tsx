import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Share,
  Linking,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/useThemeStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { themes, ThemeName } from '../constants/themes';
import { languages, LanguageCode } from '../constants/languages';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, themeName, setTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const {
    soundEnabled,
    hapticEnabled,
    jaiBlimGreeting,
    showAmbedkarWatermark,
    setSoundEnabled,
    setHapticEnabled,
    setJaiBlimGreeting,
    setShowAmbedkarWatermark,
    loadSettings,
  } = useSettingsStore();

  const [showAboutApp, setShowAboutApp] = useState(false);
  const [showAboutBasasaheb, setShowAboutBasasaheb] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Handle toggle with haptic and sound feedback
  const handleToggle = async (
    toggleFn: (value: boolean) => Promise<void>,
    currentValue: boolean,
    label: string
  ) => {
    // Provide haptic feedback if enabled
    if (hapticEnabled && currentValue === false) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Toggle the setting
    await toggleFn(!currentValue);
    
    // Show confirmation for certain settings
    if (label === 'Jai Bhim Greeting' && !currentValue) {
      Alert.alert('✅ Enabled', '🙏 Jai Bhim greeting will now show on app start!');
    }
  };

  const handleShareApp = async () => {
    if (hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const shareMessage = '🙏 Jai Bhim! Check out Bhim Universal Calculator - A world-class calculator app inspired by Dr. B.R. Ambedkar with 20+ smart tools, AI voice calculator, and multilingual support. Free Forever! Download now!';
      
      const result = await Share.share(
        {
          message: shareMessage,
          title: 'Bhim Universal Calculator',
        },
        {
          dialogTitle: 'Share Bhim Calculator',
        }
      );
      
      console.log('Share result:', result);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared
          console.log('Message was shared successfully');
        }
        Alert.alert('✅ Thank you!', 'Thanks for sharing Bhim Universal Calculator! 🙏');
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dialog was dismissed');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      // Fallback alert with the message
      Alert.alert(
        '📤 Share Bhim Calculator',
        '🙏 Jai Bhim! Check out Bhim Universal Calculator - A world-class calculator app inspired by Dr. B.R. Ambedkar with 20+ smart tools, AI voice calculator, and multilingual support. Free Forever!\n\nCopy this message and share it with your friends!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRateUs = async () => {
    if (hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      '⭐ Rate Bhim Calculator',
      'Thank you for using Bhim Universal Calculator! Your feedback helps us improve and spread awareness about Dr. B.R. Ambedkar\'s mission.\n\nWould you like to rate us?',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: '⭐ Rate Now',
          onPress: async () => {
            try {
              // Try to open Google Play Store app or web link
              // Replace 'com.bhimcalculator' with your actual package name after publishing
              const packageName = 'com.bhimcalculator';
              const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
              const playStoreAppUrl = `market://details?id=${packageName}`;
              
              // Try to open Play Store app first, fallback to web
              const supported = await Linking.canOpenURL(playStoreAppUrl);
              
              if (supported) {
                console.log('Opening Play Store app...');
                await Linking.openURL(playStoreAppUrl);
              } else {
                console.log('Opening Play Store web...');
                // Open in browser if Play Store app is not available
                const canOpenWeb = await Linking.canOpenURL(playStoreUrl);
                if (canOpenWeb) {
                  await Linking.openURL(playStoreUrl);
                } else {
                  // Last fallback - show thank you message
                  Alert.alert(
                    '🙏 Thank You!',
                    'We appreciate your support!\n\nPlay Store link will be available once the app is published.\n\nJai Bhim! 🙏',
                    [{ text: 'OK' }]
                  );
                }
              }
            } catch (error) {
              console.error('Rate Us error:', error);
              Alert.alert(
                '🙏 Thank You!',
                'We appreciate your support!\n\nPlay Store link will be available once the app is published.\n\nJai Bhim! 🙏',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
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
          {/* General Settings */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>General</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high" size={24} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Sound Feedback</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={() => handleToggle(setSoundEnabled, soundEnabled, 'Sound Feedback')}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait" size={24} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Haptic Feedback</Text>
              </View>
              <Switch
                value={hapticEnabled}
                onValueChange={() => handleToggle(setHapticEnabled, hapticEnabled, 'Haptic Feedback')}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </View>

          {/* Ambedkar Theme Settings */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ambedkar Inspiration</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="hand-right" size={24} color="#FFC107" />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Jai Bhim Greeting</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Play greeting sound on app start
                  </Text>
                </View>
              </View>
              <Switch
                value={jaiBlimGreeting}
                onValueChange={() => handleToggle(setJaiBlimGreeting, jaiBlimGreeting, 'Jai Bhim Greeting')}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="image" size={24} color="#FFC107" />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Babasaheb Watermark</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Show background image
                  </Text>
                </View>
              </View>
              <Switch
                value={showAmbedkarWatermark}
                onValueChange={() => handleToggle(setShowAmbedkarWatermark, showAmbedkarWatermark, 'Watermark')}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </View>

          {/* Theme Selection */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Theme</Text>
            {(Object.keys(themes) as ThemeName[]).map((name) => (
              <TouchableOpacity
                key={name}
                style={styles.themeRow}
                onPress={() => setTheme(name)}
              >
                <View style={[styles.themePreview, { backgroundColor: themes[name].primary }]} />
                <Text style={[styles.themeName, { color: theme.text }]}>
                  {name === 'deepBlue'
                    ? 'Deep Blue'
                    : name === 'constitutionGold'
                    ? 'Constitution Gold'
                    : name === 'nightMode'
                    ? 'Night Mode'
                    : 'Gradient Glow'}
                </Text>
                {themeName === name && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* About Section */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
            
            <TouchableOpacity
              style={styles.aboutRow}
              onPress={() => setShowAboutApp(true)}
            >
              <Ionicons name="information-circle" size={24} color={theme.primary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>About App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutRow}
              onPress={() => setShowAboutBasasaheb(true)}
            >
              <Ionicons name="book" size={24} color="#FFC107" />
              <Text style={[styles.settingLabel, { color: theme.text }]}>About Babasaheb</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutRow}
              onPress={handleShareApp}
            >
              <Ionicons name="share-social" size={24} color={theme.accent} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Share App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutRow}
              onPress={handleRateUs}
            >
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Rate Us</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              “Educate, Agitate, Organize”
            </Text>
            <Text style={[styles.footerSubtext, { color: theme.textSecondary }]}>
              - Dr. B.R. Ambedkar
            </Text>
          </View>
        </ScrollView>

        {/* About App Modal */}
        <Modal
          visible={showAboutApp}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAboutApp(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <Ionicons name="calculator" size={32} color={theme.primary} />
                <TouchableOpacity onPress={() => setShowAboutApp(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={[styles.modalTitle, { color: theme.primary }]}>
                  Bhim Universal Calculator
                </Text>
                
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Inspired by Dr. B.R. Ambedkar
                </Text>

                <View style={styles.featureSection}>
                  <Text style={[styles.sectionHeader, { color: theme.text }]}>✨ Features</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    • <Text style={{ fontWeight: 'bold' }}>Basic & Scientific</Text> Calculators with mathjs integration{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>AI Voice Calculator</Text> - Natural language processing{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>157 World Currencies</Text> - Including all Gulf currencies{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Business Tools</Text> - EMI, GST, Profit/Loss, Discount{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>20+ Mini Calculators</Text> - For everyday use{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>17 Languages</Text> - Multilingual support{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>4 Themes</Text> - Including Constitution Gold{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Daily Quotes</Text> - Inspiration from Dr. Ambedkar
                  </Text>
                </View>

                <View style={styles.featureSection}>
                  <Text style={[styles.sectionHeader, { color: theme.text }]}>🎯 Mission</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    "Educate, Agitate, Organize" - Dr. B.R. Ambedkar{'\n\n'}
                    This app honors Dr. Ambedkar's vision of equality, education, and progress. We provide world-class calculation tools free forever to empower everyone.
                  </Text>
                </View>

                <View style={styles.featureSection}>
                  <Text style={[styles.sectionHeader, { color: theme.text }]}>📱 App Info</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Version:</Text> 2.0.0{'\n'}
                    <Text style={{ fontWeight: 'bold' }}>Status:</Text> Free Forever 🎉{'\n'}
                    <Text style={{ fontWeight: 'bold' }}>Platform:</Text> Android, iOS, Web{'\n'}
                    <Text style={{ fontWeight: 'bold' }}>Backend:</Text> FastAPI + MongoDB{'\n'}
                    <Text style={{ fontWeight: 'bold' }}>AI:</Text> Powered by Emergent LLM
                  </Text>
                </View>

                <Text style={[styles.modalFooter, { color: theme.textSecondary }]}>
                  Made with ❤️ for everyone
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* About Babasaheb Modal */}
        <Modal
          visible={showAboutBasasaheb}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAboutBasasaheb(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <Ionicons name="person" size={32} color="#FFC107" />
                <TouchableOpacity onPress={() => setShowAboutBasasaheb(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={[styles.modalTitle, { color: theme.primary }]}>
                  Dr. Bhimrao Ramji Ambedkar
                </Text>
                
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  (1891 - 1956)
                </Text>

                <View style={styles.featureSection}>
                  <Text style={[styles.sectionHeader, { color: theme.text }]}>👤 About</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    Dr. B.R. Ambedkar was an Indian jurist, economist, social reformer, and political leader who dedicated his life to fighting social discrimination and establishing equality in India.
                  </Text>
                </View>

                <View style={styles.featureSection}>
                  <Text style={[styles.sectionHeader, { color: theme.text }]}>🎓 Education</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    • Master's degree from Columbia University, USA{'\n'}
                    • Doctorate from London School of Economics{'\n'}
                    • Law degree from Gray's Inn, London{'\n'}
                    • One of the most educated Indians of his time
                  </Text>
                </View>

                <View style={styles.featureSection}>
                  <Text style={[styles.sectionHeader, { color: theme.text }]}>📜 Achievements</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    • <Text style={{ fontWeight: 'bold' }}>Father of the Indian Constitution</Text> - Principal architect{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>First Law Minister</Text> - Independent India{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Social Reformer</Text> - Fought against untouchability{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Dalit Buddhist Movement</Text> - Inspired millions{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Women's Rights Advocate</Text> - Championed equality
                  </Text>
                </View>

                <View style={styles.featureSection}>
                  <Text style={[styles.sectionHeader, { color: theme.text }]}>💡 Philosophy</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    His famous principle: <Text style={{ fontWeight: 'bold', color: theme.primary }}>"Educate, Agitate, Organize"</Text>{'\n\n'}
                    He believed that education is the key to social liberation and that every person deserves equal rights regardless of caste, creed, or religion.
                  </Text>
                </View>

                <View style={styles.featureSection}>
                  <Text style={[styles.sectionHeader, { color: theme.text }]}>🙏 Legacy</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    Dr. Ambedkar's work continues to inspire millions around the world. His vision of a casteless, equal society remains relevant today. The Indian Constitution he drafted protects the rights of all citizens and is celebrated as one of the world's finest.
                  </Text>
                </View>

                <Text style={[styles.modalFooter, { color: theme.textSecondary }]}>
                  Jai Bhim! 🙏
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  themeName: {
    flex: 1,
    fontSize: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    maxHeight: '90%',
    borderRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  featureSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    lineHeight: 24,
  },
  modalFooter: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
});
