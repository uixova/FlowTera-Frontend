/**
 * i18n helpers — backend enum değerlerini yerelleştirir.
 *
 * Backend'de her zaman İngilizce saklanan kategori / durum / ödeme yöntemi
 * değerlerini, aktif dile göre görüntülemek için bu fonksiyonları kullan.
 *
 * Kullanım:
 *   import { useI18n } from '../../utils/i18nHelpers';
 *   const { tCategory, tStatus, tPayment } = useI18n();
 *   <span>{tCategory('Shopping')}</span>  // "Alışveriş" veya "Shopping"
 */
import { useTranslation } from 'react-i18next';

// Category map (backend key → localized label) 
const CATEGORY_LABELS: Record<string, { tr: string; en: string }> = {
  Food:          { tr: 'Yiyecek & İçecek',    en: 'Food & Beverage' },
  Transport:     { tr: 'Ulaşım',              en: 'Transport' },
  Accommodation: { tr: 'Konaklama',           en: 'Accommodation' },
  Health:        { tr: 'Sağlık',              en: 'Health' },
  Entertainment: { tr: 'Eğlence',             en: 'Entertainment' },
  Office:        { tr: 'Ofis Malzemeleri',    en: 'Office Supplies' },
  Education:     { tr: 'Eğitim',              en: 'Education' },
  Technology:    { tr: 'Teknoloji',           en: 'Technology' },
  Shopping:      { tr: 'Alışveriş',           en: 'Shopping' },
  Utilities:     { tr: 'Faturalar',           en: 'Utilities' },
  Finance:       { tr: 'Finans & Sigorta',    en: 'Finance & Insurance' },
  Events:        { tr: 'Etkinlik & Toplantı', en: 'Events & Meetings' },
  Marketing:     { tr: 'Pazarlama & Reklam',  en: 'Marketing & Advertising' },
  Legal:         { tr: 'Hukuk & Danışmanlık', en: 'Legal & Consulting' },
  Other:         { tr: 'Diğer',               en: 'Other' },
};

const STATUS_LABELS: Record<string, { tr: string; en: string }> = {
  pending:   { tr: 'Beklemede',  en: 'Pending' },
  approved:  { tr: 'Onaylandı', en: 'Approved' },
  rejected:  { tr: 'Reddedildi',en: 'Rejected' },
  active:    { tr: 'Aktif',     en: 'Active' },
  inactive:  { tr: 'Pasif',     en: 'Inactive' },
  cancelled: { tr: 'İptal',     en: 'Cancelled' },
  completed: { tr: 'Tamamlandı',en: 'Completed' },
  draft:     { tr: 'Taslak',    en: 'Draft' },
  deleted:   { tr: 'Silindi',   en: 'Deleted' },
  'on road': { tr: 'Yolda',     en: 'On Road' },
  onroad:    { tr: 'Yolda',     en: 'On Road' },
};

const TRIP_CATEGORY_LABELS: Record<string, { tr: string; en: string }> = {
  Business:   { tr: 'İş Gezisi',          en: 'Business' },
  Vacation:   { tr: 'Tatil',              en: 'Vacation' },
  Event:      { tr: 'Etkinlik',           en: 'Event' },
  Conference: { tr: 'Konferans',          en: 'Conference' },
  Training:   { tr: 'Eğitim',            en: 'Training' },
  Operation:  { tr: 'Operasyon',          en: 'Operation' },
  Marketing:  { tr: 'Pazarlama & Reklam', en: 'Marketing & Advertising' },
  Other:      { tr: 'Diğer',              en: 'Other' },
};

const VEHICLE_LABELS: Record<string, { tr: string; en: string }> = {
  Plane:      { tr: 'Uçak',       en: 'Plane' },
  Train:      { tr: 'Tren',       en: 'Train' },
  Car:        { tr: 'Araba',      en: 'Car' },
  Bus:        { tr: 'Otobüs',     en: 'Bus' },
  Ship:       { tr: 'Gemi',       en: 'Ship' },
  Taxi:       { tr: 'Taksi',      en: 'Taxi' },
  Motorcycle: { tr: 'Motosiklet', en: 'Motorcycle' },
  Other:      { tr: 'Diğer',      en: 'Other' },
};

const PAYMENT_LABELS: Record<string, { tr: string; en: string }> = {
  'Cash':           { tr: 'Nakit',           en: 'Cash' },
  'Credit Card':    { tr: 'Kredi Kartı',     en: 'Credit Card' },
  'Bank Transfer':  { tr: 'Banka Transferi', en: 'Bank Transfer' },
  'Debit Card':     { tr: 'Banka Kartı',     en: 'Debit Card' },
  'Mobile Payment': { tr: 'Mobil Ödeme',     en: 'Mobile Payment' },
  'Check':          { tr: 'Çek',             en: 'Check' },
  'Other':          { tr: 'Diğer',           en: 'Other' },
};

/** Hook — aktif dile göre enum çeviri fonksiyonları döner */
export function useI18n() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'tr') as 'tr' | 'en';

  const resolve = (map: Record<string, { tr: string; en: string }>, key: string): string =>
    map[key]?.[lang] ?? map[key]?.tr ?? key;

  return {
    /** Backend'den gelen category (Shopping, Food, …) → yerelleştirilmiş etiket */
    tCategory:     (key: string) => resolve(CATEGORY_LABELS, key),
    /** pending / approved / rejected → yerelleştirilmiş durum etiketi */
    tStatus:       (key: string) => resolve(STATUS_LABELS, key),
    /** Cash / Credit Card / … → yerelleştirilmiş ödeme yöntemi */
    tPayment:      (key: string) => resolve(PAYMENT_LABELS, key),
    /** Business / Vacation / … → yerelleştirilmiş gezi kategorisi */
    tTripCategory: (key: string) => resolve(TRIP_CATEGORY_LABELS, key),
    /** Plane / Train / … → yerelleştirilmiş araç türü */
    tVehicle:      (key: string) => resolve(VEHICLE_LABELS, key),
    /** Aktif dil kodu */
    lang,
  };
}

/** Hook'suz versiyon — React dışında (i18next instance'ından dil okur) */
import i18n from '../locales/i18n';

function resolvePlain(map: Record<string, { tr: string; en: string }>, key: string): string {
  const lang = (i18n.language || 'tr') as 'tr' | 'en';
  return map[key]?.[lang] ?? map[key]?.tr ?? key;
}

export const tCategory     = (key: string) => resolvePlain(CATEGORY_LABELS, key);
export const tStatus       = (key: string) => resolvePlain(STATUS_LABELS, key);
export const tPayment      = (key: string) => resolvePlain(PAYMENT_LABELS, key);
export const tTripCategory = (key: string) => resolvePlain(TRIP_CATEGORY_LABELS, key);
export const tVehicle      = (key: string) => resolvePlain(VEHICLE_LABELS, key);

// Kategori seçenekleri — dropdown için (hem value hem label döner)
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, labels]) => ({
  value,
  get label() { return resolvePlain(CATEGORY_LABELS, value); },
}));

export const PAYMENT_OPTIONS = Object.entries(PAYMENT_LABELS).map(([value, labels]) => ({
  value,
  get label() { return resolvePlain(PAYMENT_LABELS, value); },
}));
