import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface CalculatorStore {
  history: HistoryItem[];
  addHistory: (expression: string, result: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  history: [],

  addHistory: async (expression: string, result: string) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: Date.now(),
    };
    const updated = [item, ...get().history].slice(0, 50); // max 50 entries
    set({ history: updated });
    await AsyncStorage.setItem('calc_history', JSON.stringify(updated));
  },

  loadHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem('calc_history');
      if (stored) {
        set({ history: JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  },

  clearHistory: async () => {
    set({ history: [] });
    await AsyncStorage.removeItem('calc_history');
  },
}));