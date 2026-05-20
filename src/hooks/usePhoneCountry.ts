import { useMemo } from 'react';

export interface Country {
  code: string;
  name: string;
  dial: string;
  format: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dial: '+1', format: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', format: '#### ######' },
  { code: 'TR', name: 'Türkiye', dial: '+90', format: '### ### ## ##' },
  { code: 'DE', name: 'Germany', dial: '+49', format: '### ########' },
  { code: 'FR', name: 'France', dial: '+33', format: '# ## ## ## ##' },
  { code: 'IT', name: 'Italy', dial: '+39', format: '### ### ####' },
  { code: 'ES', name: 'Spain', dial: '+34', format: '### ### ###' },
  { code: 'NL', name: 'Netherlands', dial: '+31', format: '# ########' },
  { code: 'PL', name: 'Poland', dial: '+48', format: '### ### ###' },
  { code: 'SE', name: 'Sweden', dial: '+46', format: '##-### ## ##' },
  { code: 'NO', name: 'Norway', dial: '+47', format: '### ## ###' },
  { code: 'DK', name: 'Denmark', dial: '+45', format: '## ## ## ##' },
  { code: 'FI', name: 'Finland', dial: '+358', format: '## ### ## ##' },
  { code: 'CH', name: 'Switzerland', dial: '+41', format: '## ### ## ##' },
  { code: 'AT', name: 'Austria', dial: '+43', format: '### #######' },
  { code: 'BE', name: 'Belgium', dial: '+32', format: '### ## ## ##' },
  { code: 'PT', name: 'Portugal', dial: '+351', format: '### ### ###' },
  { code: 'GR', name: 'Greece', dial: '+30', format: '### ### ####' },
  { code: 'RU', name: 'Russia', dial: '+7', format: '### ###-##-##' },
  { code: 'UA', name: 'Ukraine', dial: '+380', format: '## ### ## ##' },
  { code: 'CA', name: 'Canada', dial: '+1', format: '(###) ###-####' },
  { code: 'MX', name: 'Mexico', dial: '+52', format: '## #### ####' },
  { code: 'BR', name: 'Brazil', dial: '+55', format: '## #####-####' },
  { code: 'AR', name: 'Argentina', dial: '+54', format: '## ####-####' },
  { code: 'AU', name: 'Australia', dial: '+61', format: '### ### ###' },
  { code: 'JP', name: 'Japan', dial: '+81', format: '##-####-####' },
  { code: 'KR', name: 'South Korea', dial: '+82', format: '##-####-####' },
  { code: 'CN', name: 'China', dial: '+86', format: '### #### ####' },
  { code: 'IN', name: 'India', dial: '+91', format: '##### #####' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', format: '## ### ####' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', format: '## ### ####' },
  { code: 'AZ', name: 'Azerbaijan', dial: '+994', format: '## ### ## ##' },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7', format: '### ###-##-##' },
];

const LOCALE_TO_CODE: Record<string, string> = {
  'tr': 'TR', 'en': 'US', 'de': 'DE', 'fr': 'FR', 'it': 'IT',
  'es': 'ES', 'nl': 'NL', 'ru': 'RU', 'az': 'AZ', 'kk': 'KZ',
  'uk': 'UA', 'pl': 'PL', 'pt': 'PT', 'ar': 'SA', 'zh': 'CN',
  'ja': 'JP', 'ko': 'KR', 'hi': 'IN'
};

const detectDefaultCountry = (): Country => {
  try {
    const preferredLanguages = navigator.languages || [navigator.language || 'en-US'];
    
    for (const lang of preferredLanguages) {
      const [primary, region] = lang.split('-');
      const countryCode = region?.toUpperCase();
      const languageCode = primary.toLowerCase();

      if (countryCode) {
        const found = COUNTRIES.find(c => c.code === countryCode);
        if (found) return found;
      }

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
  const defaultCountry = useMemo<Country>(() => detectDefaultCountry(), []);
  return { countries: COUNTRIES, defaultCountry };
};