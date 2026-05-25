import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

function makeHistoryStore(storageKey: string) {
  return create<{
    history: HistoryItem[];
    addHistory: (expression: string, result: string) => Promise<void>;
    loadHistory: () => Promise<void>;
    clearHistory: () => Promise<void>;
  }>((set, get) => ({
    history: [],

    addHistory: async (expression: string, result: string) => {
      const item: HistoryItem = {
        id: Date.now().toString(),
        expression,
        result,
        timestamp: Date.now(),
      };
      const updated = [item, ...get().history].slice(0, 50);
      set({ history: updated });
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    },

    loadHistory: async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) set({ history: JSON.parse(stored) });
      } catch {}
    },

    clearHistory: async () => {
      set({ history: [] });
      await AsyncStorage.removeItem(storageKey);
    },
  }));
}

export const useBasicHistoryStore = makeHistoryStore('basic_history');
export const useScientificHistoryStore = makeHistoryStore('scientific_history');
export const useVoiceHistoryStore = makeHistoryStore('voice_history');

// backward compat
export const useCalculatorStore = useBasicHistoryStore;
