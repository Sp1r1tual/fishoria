import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  loadTranslations,
  I18N_STORAGE_KEY,
  type SupportedLanguage,
} from '@/i18n';

import { updateSettings } from '@/store/slices/settingsSlice';
import {
  usePlayerQuery,
  useUpdateLanguageMutation,
} from '@/queries/player.queries';

export function LanguageSync() {
  const { data: player } = usePlayerQuery();
  const { mutate: updateServerLang } = useUpdateLanguageMutation();
  const { i18n } = useTranslation();
  const syncedRef = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.lang = i18n.language || 'en';
  }, [i18n.language]);

  useEffect(() => {
    if (!player || !player.user) return;

    if (syncedRef.current) return;

    const serverLang = player.user.language as SupportedLanguage;
    const localLang = i18n.language as SupportedLanguage;

    if (serverLang === localLang) {
      syncedRef.current = true;
      return;
    }

    if (serverLang === 'en' && localLang === 'uk') {
      updateServerLang('uk');
      syncedRef.current = true;
    } else if (serverLang === 'en' || serverLang === 'uk') {
      loadTranslations(serverLang).then(() => {
        localStorage.setItem(I18N_STORAGE_KEY, serverLang);
        dispatch(updateSettings({ language: serverLang }));
        syncedRef.current = true;
      });
    }
  }, [player, i18n, updateServerLang, dispatch]);

  return null;
}
