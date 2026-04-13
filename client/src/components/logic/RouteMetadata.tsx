import { useEffect } from 'react';
import { useMatches } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

const setMetaDescription = (content: string) => {
  let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');

  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'description';
    document.head.appendChild(tag);
  }

  tag.content = content;
};

export const RouteMetadata = () => {
  const { t } = useTranslation();
  const matches = useMatches();

  useEffect(() => {
    const activeMatch = [...matches].reverse().find((m) => m.handle);
    const handle = activeMatch?.handle as
      | {
          title?: string | ((t: TFunction) => string);
          description?: string | ((t: TFunction) => string);
        }
      | undefined;

    if (handle) {
      const pageTitle =
        typeof handle.title === 'function'
          ? handle.title(t)
          : (handle.title ?? t('metadata.defaultTitle'));

      const pageDescription =
        typeof handle.description === 'function'
          ? handle.description(t)
          : (handle.description ?? t('metadata.defaultDescription'));

      document.title = pageTitle;
      setMetaDescription(pageDescription);
    } else {
      document.title = t('metadata.defaultTitle');
      setMetaDescription(t('metadata.defaultDescription'));
    }
  }, [matches, t]);

  return null;
};
