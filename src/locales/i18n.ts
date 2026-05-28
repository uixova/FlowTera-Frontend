import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { detectLanguage, SUPPORTED_LANGUAGES } from './languages';

// Consolidated locale files
import common from './common.json';
import expenses from './expenses.json';
import trips from './trips.json';
import dashboard from './dashboard.json';
import teams from './teams.json';
import settings from './settings.json';
import analysis from './analysis.json';
import history from './history.json';
import auth from './auth.json';
import help from './help.json';
import subscription from './subscription.json';
import errors from './errors.json';
import enums from './enums.json';
import archive from './archive.json';
import requests from './requests.json';

type BilingualValue = { tr: string; en: string };
type BilingualRecord = Record<string, BilingualValue | string>;

/** Transform { key: { tr, en } } → { key: localizedString } */
function flatten(obj: BilingualRecord, lang: string, fallback = 'tr'): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object' && ('tr' in val || 'en' in val)) {
      const bv = val as BilingualValue;
      result[key] = bv[lang as 'tr' | 'en'] ?? bv[fallback as 'tr' | 'en'] ?? key;
    } else {
      result[key] = val as string;
    }
  }
  return result;
}

const namespaces: Record<string, BilingualRecord> = {
  // common
  'common.buttons': common.buttons as BilingualRecord,
  'common.errors': common.errors as BilingualRecord,
  'common.forms': common.forms as BilingualRecord,
  'common.modals': common.modals as BilingualRecord,
  'common.nav': common.nav as BilingualRecord,
  'common.notifications': common.notifications as BilingualRecord,
  'common.currency': common.currency as BilingualRecord,
  'common.theme': common.theme as BilingualRecord,
  'common.time': (common as any).time as BilingualRecord,
  // expenses
  'expenses.create': expenses.create as BilingualRecord,
  'expenses.list': expenses.list as BilingualRecord,
  'expenses.detail': expenses.detail as BilingualRecord,
  'expenses.filter': expenses.filter as BilingualRecord,
  // trips
  'trips.create': trips.create as BilingualRecord,
  'trips.list': trips.list as BilingualRecord,
  'trips.detail': trips.detail as BilingualRecord,
  'trips.filter': trips.filter as BilingualRecord,
  // dashboard
  'dashboard.overview': dashboard.overview as BilingualRecord,
  'dashboard.activities': dashboard.activities as BilingualRecord,
  'dashboard.graphics': dashboard.graphics as BilingualRecord,
  'dashboard.report': dashboard.report as BilingualRecord,
  // teams
  'teams': teams.index as BilingualRecord,
  'teams.list': teams.list as BilingualRecord,
  'teams.members': teams.members as BilingualRecord,
  'teams.settings': teams.settings as BilingualRecord,
  'teams.addMember': teams.addMember as BilingualRecord,
  'teams.activityLog': teams.activityLog as BilingualRecord,
  'teams.create': teams.create as BilingualRecord,
  'teams.editMember': teams.editMember as BilingualRecord,
  'teams.requestPanel': teams.requestPanel as BilingualRecord,
  'teams.permissions': teams.permissions as BilingualRecord,
  // settings
  'settings': settings.index as BilingualRecord,
  'settings.profile': settings.profile as BilingualRecord,
  'settings.security': settings.security as BilingualRecord,
  'settings.notifications': settings.notifications as BilingualRecord,
  'settings.plan': settings.plan as BilingualRecord,
  'settings.activity': settings.activity as BilingualRecord,
  // analysis
  'analysis': analysis.index as BilingualRecord,
  'analysis.overview': analysis.overview as BilingualRecord,
  'analysis.charts': analysis.charts as BilingualRecord,
  'analysis.export': analysis.export as BilingualRecord,
  // history
  'history': history.index as BilingualRecord,
  'history.list': history.list as BilingualRecord,
  'history.filter': history.filter as BilingualRecord,
  // auth
  'auth.login': auth.login as BilingualRecord,
  'auth.signup': auth.signup as BilingualRecord,
  'auth.password': auth.password as BilingualRecord,
  'auth.landing': auth.landing as BilingualRecord,
  'auth.subscription': auth.subscription as BilingualRecord,
  'auth.features': auth.features as BilingualRecord,
  'auth.faq': auth.faq as BilingualRecord,
  'auth.mail': auth.mail as BilingualRecord,
  'auth.phone': auth.phone as BilingualRecord,
  // help
  'help': help.index as BilingualRecord,
  'help.sidebar': help.sidebar as BilingualRecord,
  'help.content': help.content as BilingualRecord,
  // subscription
  'subscription': subscription.index as BilingualRecord,
  'subscription.payment': subscription.payment as BilingualRecord,
  // errors
  'errors.notFound': errors.notFound as BilingualRecord,
  'errors.unauthorized': errors.unauthorized as BilingualRecord,
  // enums (backend → localized)
  'categories': enums.categories as BilingualRecord,
  'status': enums.status as BilingualRecord,
  'payment_methods': enums.payment_methods as BilingualRecord,
  // pages
  'archive': archive as BilingualRecord,
  'requests': requests as BilingualRecord,
};

const resources: Record<string, Record<string, Record<string, string>>> = {};
for (const lang of SUPPORTED_LANGUAGES.map((l) => l.code)) {
  resources[lang] = {};
  for (const [ns, data] of Object.entries(namespaces)) {
    resources[lang][ns] = flatten(data, lang);
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'tr',
  defaultNS: 'common.buttons',
  ns: Object.keys(namespaces),
  interpolation: { escapeValue: false },
  saveMissing: false,
  debug: false,
});

export default i18n;
