import { create } from 'zustand';
import { LanguageCode } from '../constants/languages';

interface LanguageStore {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
}));
