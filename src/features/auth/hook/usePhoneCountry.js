import { useMemo } from 'react';

export const COUNTRIES = [
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'TR', name: 'Türkiye', dial: '+90' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'ES', name: 'Spain', dial: '+34' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'PL', name: 'Poland', dial: '+48' },
  { code: 'SE', name: 'Sweden', dial: '+46' },
  { code: 'NO', name: 'Norway', dial: '+47' },
  { code: 'DK', name: 'Denmark', dial: '+45' },
  { code: 'FI', name: 'Finland', dial: '+358' },
  { code: 'CH', name: 'Switzerland', dial: '+41' },
  { code: 'AT', name: 'Austria', dial: '+43' },
  { code: 'BE', name: 'Belgium', dial: '+32' },
  { code: 'PT', name: 'Portugal', dial: '+351' },
  { code: 'GR', name: 'Greece', dial: '+30' },
  { code: 'RU', name: 'Russia', dial: '+7' },
  { code: 'UA', name: 'Ukraine', dial: '+380' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'MX', name: 'Mexico', dial: '+52' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'AR', name: 'Argentina', dial: '+54' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'KR', name: 'South Korea', dial: '+82' },
  { code: 'CN', name: 'China', dial: '+86' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'AZ', name: 'Azerbaijan', dial: '+994' },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7' },
];

const LOCALE_TO_CODE = {
  'tr': 'TR', 'en': 'US', 'de': 'DE', 'fr': 'FR', 'it': 'IT',
  'es': 'ES', 'nl': 'NL', 'ru': 'RU', 'az': 'AZ', 'kk': 'KZ',
  'uk': 'UA', 'pl': 'PL', 'pt': 'PT', 'ar': 'SA', 'zh': 'CN',
  'ja': 'JP', 'ko': 'KR', 'hi': 'IN'
};

const detectDefaultCountry = () => {
  try {
    // Kullanıcının tercih ettiği dilleri al
    const preferredLanguages = navigator.languages || [navigator.language || 'en-US'];
    
    for (const lang of preferredLanguages) {
      const [primary, region] = lang.split('-');
      const countryCode = region?.toUpperCase();
      const languageCode = primary.toLowerCase();

      // Önce direkt bölge kodundan bulmaya çalış
      if (countryCode) {
        const found = COUNTRIES.find(c => c.code === countryCode);
        if (found) return found;
      }

      // Bölge kodu yoksa veya listede değilse dile göre eşleştir
      const mapped = LOCALE_TO_CODE[languageCode];
      if (mapped) {
        const found = COUNTRIES.find(c => c.code === mapped);
        if (found) return found;
      }
    }
  } catch (e) {
    console.error("Ülke tespiti başarısız:", e);
  }
  return COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0]; 
};

export const usePhoneCountry = () => {
  const defaultCountry = useMemo(() => detectDefaultCountry(), []);
  return { countries: COUNTRIES, defaultCountry };
};