import { create } from 'zustand';
import { themes, ThemeName, Theme } from '../constants/themes';

interface ThemeStore {
  themeName: ThemeName;
  theme: Theme;
  setTheme: (themeName: ThemeName) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeName: 'deepBlue',
  theme: themes.deepBlue,
  setTheme: (themeName) => set({ themeName, theme: themes[themeName] }),
}));
