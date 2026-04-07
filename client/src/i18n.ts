import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const I18N_STORAGE_KEY = 'i18nextLng';
const LANG_INIT_KEY = 'fishing_lang_initialized';

export type SupportedLanguage = 'en' | 'uk';

export function detectLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(I18N_STORAGE_KEY);
  if (stored === 'uk' || stored === 'en') return stored as SupportedLanguage;

  if (!localStorage.getItem(LANG_INIT_KEY)) {
    const browserLang = navigator.language?.toLowerCase() ?? 'en';
    return browserLang.startsWith('uk') ? 'uk' : 'en';
  }
  return 'en';
}

export function markLanguageInitialized() {
  localStorage.setItem(LANG_INIT_KEY, '1');
}

export function isFirstLanguageRun(): boolean {
  return !localStorage.getItem(LANG_INIT_KEY);
}

i18n.use(initReactI18next).init({
  lng: detectLanguage(),
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  resources: {},
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.language;

export async function loadTranslations(lang: SupportedLanguage) {
  try {
    const res = await fetch(`/locales/${lang}/translation.json`);
    const data = await res.json();
    i18n.addResourceBundle(lang, 'translation', data, true, true);
    await i18n.changeLanguage(lang);
  } catch (err) {
    console.error(`Failed to load translations for ${lang}:`, err);
  }
}

export default i18n;
