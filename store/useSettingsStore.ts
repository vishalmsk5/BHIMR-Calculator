import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  jaiBlimGreeting: boolean;
  showAmbedkarWatermark: boolean;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setHapticEnabled: (enabled: boolean) => Promise<void>;
  setJaiBlimGreeting: (enabled: boolean) => Promise<void>;
  setShowAmbedkarWatermark: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  soundEnabled: true,
  hapticEnabled: true,
  jaiBlimGreeting: false,
  showAmbedkarWatermark: false,
  
  setSoundEnabled: async (enabled) => {
    set({ soundEnabled: enabled });
    await AsyncStorage.setItem('soundEnabled', JSON.stringify(enabled));
  },
  
  setHapticEnabled: async (enabled) => {
    set({ hapticEnabled: enabled });
    await AsyncStorage.setItem('hapticEnabled', JSON.stringify(enabled));
  },
  
  setJaiBlimGreeting: async (enabled) => {
    set({ jaiBlimGreeting: enabled });
    await AsyncStorage.setItem('jaiBlimGreeting', JSON.stringify(enabled));
  },
  
  setShowAmbedkarWatermark: async (enabled) => {
    set({ showAmbedkarWatermark: enabled });
    await AsyncStorage.setItem('showAmbedkarWatermark', JSON.stringify(enabled));
  },
  
  loadSettings: async () => {
    try {
      const soundEnabled = await AsyncStorage.getItem('soundEnabled');
      const hapticEnabled = await AsyncStorage.getItem('hapticEnabled');
      const jaiBlimGreeting = await AsyncStorage.getItem('jaiBlimGreeting');
      const showAmbedkarWatermark = await AsyncStorage.getItem('showAmbedkarWatermark');
      
      set({
        soundEnabled: soundEnabled ? JSON.parse(soundEnabled) : true,
        hapticEnabled: hapticEnabled ? JSON.parse(hapticEnabled) : true,
        jaiBlimGreeting: jaiBlimGreeting ? JSON.parse(jaiBlimGreeting) : false,
        showAmbedkarWatermark: showAmbedkarWatermark ? JSON.parse(showAmbedkarWatermark) : false,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },
}));
