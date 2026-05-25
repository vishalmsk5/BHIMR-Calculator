export const themes = {
  deepBlue: {
    primary: '#0D47A1',
    secondary: '#FFC107',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    accent: '#FFC107',
    error: '#D32F2F',
    border: '#E0E0E0',
  },
  constitutionGold: {
    primary: '#FFC107',
    secondary: '#0D47A1',
    background: '#FFF8E1',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    accent: '#0D47A1',
    error: '#D32F2F',
    border: '#FFD54F',
  },
  nightMode: {
    primary: '#0D47A1',
    secondary: '#FFC107',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    accent: '#FFC107',
    error: '#EF5350',
    border: '#2C2C2C',
  },
  gradientGlow: {
    primary: '#2196F3',
    secondary: '#FFC107',
    background: '#0A1929',
    surface: '#132F4C',
    text: '#FFFFFF',
    textSecondary: '#AAB4BE',
    accent: '#FFC107',
    error: '#EF5350',
    border: '#1E4976',
  },
};

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes.deepBlue;
