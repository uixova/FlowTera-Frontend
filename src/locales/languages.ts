export interface Language {
  code: string;
  label: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
];

export const DEFAULT_LANGUAGE = 'tr';
export const LANGUAGE_STORAGE_KEY = 'flowtera_lang';

export function detectLanguage(): string {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.find((l) => l.code === stored)) return stored;
  const browser = navigator.language?.split('-')[0];
  if (browser && SUPPORTED_LANGUAGES.find((l) => l.code === browser)) return browser;
  return DEFAULT_LANGUAGE;
}
