import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import type { SupportedLanguageType } from '@/i18n';

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

    const serverLang = player.user.language as SupportedLanguageType;
    const localLang = (i18n.resolvedLanguage ||
      i18n.language) as SupportedLanguageType;

    if (serverLang === localLang) {
      syncedRef.current = true;
      return;
    }

    if (serverLang === 'en' || serverLang === 'uk') {
      i18n.changeLanguage(serverLang).then(() => {
        dispatch(updateSettings({ language: serverLang }));
        syncedRef.current = true;
      });
    }
  }, [player, i18n, dispatch]);

  return null;
}
