import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  loadTranslations,
  I18N_STORAGE_KEY,
  type SupportedLanguage,
} from '@/i18n';

import { updateSettings } from '@/store/slices/settingsSlice';
import { usePlayerQuery } from '@/queries/player.queries';

export function LanguageSync() {
  const { data: player } = usePlayerQuery();

  const { i18n } = useTranslation();
  const syncedRef = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.lang = i18n.language || 'en';
  }, [i18n.language]);

  useEffect(() => {
    if (!player?.user || !i18n.isInitialized) return;

    if (syncedRef.current) return;

    const serverLang = player.user.language as SupportedLanguage;
    const localLang = i18n.language as SupportedLanguage;

    if (serverLang === localLang) {
      syncedRef.current = true;
      return;
    }

    if (serverLang === 'en' || serverLang === 'uk') {
      loadTranslations(serverLang).then(() => {
        localStorage.setItem(I18N_STORAGE_KEY, serverLang);
        dispatch(updateSettings({ language: serverLang }));
        syncedRef.current = true;
      });
    }
  }, [player, i18n, dispatch]);

  return null;
}
