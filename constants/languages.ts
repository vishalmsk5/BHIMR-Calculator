export const languages = {
  en: { name: 'English', nativeName: 'English', rtl: false },
  'en-IN': { name: 'English (India)', nativeName: 'English (India)', rtl: false },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  mr: { name: 'Marathi', nativeName: 'मराठी', rtl: false },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', rtl: false },
  te: { name: 'Telugu', nativeName: 'తెలుగు', rtl: false },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', rtl: false },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', rtl: false },
  bn: { name: 'Bengali', nativeName: 'বাংলা', rtl: false },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', rtl: false },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', rtl: false },
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true },
  fr: { name: 'French', nativeName: 'Français', rtl: false },
  de: { name: 'German', nativeName: 'Deutsch', rtl: false },
  es: { name: 'Spanish', nativeName: 'Español', rtl: false },
  it: { name: 'Italian', nativeName: 'Italiano', rtl: false },
  ru: { name: 'Russian', nativeName: 'Русский', rtl: false },
};

export type LanguageCode = keyof typeof languages;
