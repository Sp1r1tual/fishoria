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
    // Find the most specific handle (from child to parent)
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
          : (handle.title ?? 'Fishoria');

      const pageDescription =
        typeof handle.description === 'function'
          ? handle.description(t)
          : (handle.description ??
            'Fishoria is a free browser-based fishing simulator. Catch fish, upgrade gear and compete with anglers worldwide.');

      document.title = pageTitle;
      setMetaDescription(pageDescription);
    } else {
      document.title = 'Fishoria';
      setMetaDescription(
        'Fishoria is a free browser-based fishing simulator. Catch fish, upgrade gear and compete with anglers worldwide.',
      );
    }
  }, [matches, t]);

  return null;
};
