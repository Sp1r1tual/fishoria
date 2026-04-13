import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '@/components/UI/ScreenContainer/ScreenContainer';
import { ExpandButton } from '@/components/UI/buttons/ExpandButton/ExpandButton';

import helpIcon from '@/assets/ui/help.webp';

import styles from './Help.module.css';

interface IFaqSection {
  title: string;
  items: { q: string; a: string }[];
}

export function Help() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  const sections = t('help.sections', { returnObjects: true }) as IFaqSection[];

  return (
    <ScreenContainer
      title={t('help.title', 'Help')}
      titleIcon={helpIcon}
      onBack={() => navigate('/')}
      className={styles.help}
    >
      <section className={styles['help__content']}>
        {Array.isArray(sections) &&
          sections.map((section, sIdx) => (
            <div
              key={sIdx}
              className={`glass ${styles['help__category-group']}`}
            >
              <h2 className={styles['help__category-title']}>
                {section.title}
              </h2>
              {section.items.map((item, iIdx) => {
                const id = `s${sIdx}-i${iIdx}`;
                const isOpen = openId === id;
                return (
                  <article
                    key={id}
                    className={`glass ${styles['help__faq-card']} ${isOpen ? styles['help__faq-card--open'] : ''}`}
                  >
                    <div
                      className={styles['help__faq-header']}
                      onClick={() => setOpenId(isOpen ? null : id)}
                    >
                      <h3 className={styles['help__faq-q']}>{item.q}</h3>
                      <ExpandButton isExpanded={isOpen} />
                    </div>
                    <div
                      className={`${styles['help__faq-body']} ${isOpen ? styles['help__faq-body--open'] : ''}`}
                    >
                      <p className={styles['help__faq-a']}>{item.a}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
      </section>
    </ScreenContainer>
  );
}
