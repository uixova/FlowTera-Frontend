export { default as i18n } from './i18n';
export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, detectLanguage } from './languages';
export type { Language } from './languages';

import i18n from './i18n';
import { LANGUAGE_STORAGE_KEY } from './languages';

export function changeLanguage(code: string): void {
  i18n.changeLanguage(code);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  document.documentElement.setAttribute('lang', code);
}
