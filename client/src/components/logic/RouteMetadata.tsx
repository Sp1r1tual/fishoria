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

const setCanonical = (url: string) => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
};

const setOgUrl = (url: string) => {
  let tag = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', 'og:url');
    document.head.appendChild(tag);
  }

  tag.content = url;
};

const setOgTitle = (title: string) => {
  let tag = document.querySelector<HTMLMetaElement>(
    'meta[property="og:title"]',
  );

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', 'og:title');
    document.head.appendChild(tag);
  }

  tag.content = title;
};

const setOgDescription = (description: string) => {
  let tag = document.querySelector<HTMLMetaElement>(
    'meta[property="og:description"]',
  );

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', 'og:description');
    document.head.appendChild(tag);
  }

  tag.content = description;
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

    const currentUrl = `https://www.fishoria.online${window.location.pathname}`;

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
      setOgTitle(pageTitle);
      setOgDescription(pageDescription);
    } else {
      const defaultTitle = t('metadata.defaultTitle');
      const defaultDescription = t('metadata.defaultDescription');

      document.title = defaultTitle;
      setMetaDescription(defaultDescription);
      setOgTitle(defaultTitle);
      setOgDescription(defaultDescription);
    }

    setCanonical(currentUrl);
    setOgUrl(currentUrl);
  }, [matches, t]);

  return null;
};
