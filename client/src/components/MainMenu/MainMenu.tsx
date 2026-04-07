import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '@/hooks/core/useAppStore';
import { useNewsState } from '@/hooks/game/useNewsState';

import { Footer } from '../Footer/Footer';
import { Modal } from '../UI/modals/Modal/Modal';
import { ProfileEdit } from '../ProfileEdit/ProfileEdit';
import { WeatherForecastModal } from '../UI/modals/WeatherForecastModal/WeatherForecastModal';
import { GameClock } from '../UI/GameClock/GameClock';
import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { EditButton } from '../UI/buttons/EditButton/EditButton';
import { WeatherStatus } from '../UI/WeatherStatus/WeatherStatus';

import { navigateTo } from '@/store/slices/uiSlice';
import { usePlayerQuery } from '@/queries/player.queries';

import { getXpNeededForLevel } from '@/common/utils/experience.util';

import bannerIcon from '@/assets/ui/main_menu_banner.webp';
import mainBg from '@/assets/ui/main_menu_background.webp';
import keepnetIcon from '@/assets/ui/keepnet.webp';
import equipmentIcon from '@/assets/ui/equipment.webp';
import shopIcon from '@/assets/ui/shop.webp';
import settingsIcon from '@/assets/ui/settings.webp';
import statisticsIcon from '@/assets/ui/statistics.webp';
import coinIcon from '@/assets/ui/coin.webp';
import boatIcon from '@/assets/ui/boat.webp';
import profile01 from '@/assets/ui/profile.webp';
import profile02 from '@/assets/ui/profile_02.webp';
import profile03 from '@/assets/ui/profile_03.webp';
import profile04 from '@/assets/ui/profile_04.webp';
import guideIcon from '@/assets/ui/guide.webp';
import questsIcon from '@/assets/ui/quests.webp';
import helpIcon from '@/assets/ui/help.webp';
import newsIcon from '@/assets/ui/news.webp';
import achievementsIcon from '@/assets/ui/achievements.webp';

import styles from './MainMenu.module.css';

export function MainMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: player, isLoading } = usePlayerQuery();
  const { hasUnread } = useNewsState();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const { t } = useTranslation();

  const avatarMap = {
    'profile.webp': profile01,
    'profile_02.webp': profile02,
    'profile_03.webp': profile03,
    'profile_04.webp': profile04,
  };

  const level = player?.level ?? 1;
  const xp = player?.xp ?? 0;
  const money = player?.money ?? 0;
  const name = player?.user?.username ?? 'Angler';
  const avatar = player?.user?.avatar ?? 'profile.webp';

  const currentAvatarImg =
    avatarMap[avatar as keyof typeof avatarMap] || profile01;

  const xpNeeded = getXpNeededForLevel(level);
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);

  const menuActions = [
    {
      id: 'btn-inventory',
      icon: keepnetIcon,
      label: t('mainMenu.keepnet'),
      path: '/keepnet',
    },
    {
      id: 'btn-gear',
      icon: equipmentIcon,
      label: t('mainMenu.equipment'),
      path: '/equipment',
    },
    {
      id: 'btn-shop',
      icon: shopIcon,
      label: t('mainMenu.shop'),
      path: '/marketplace',
    },
    {
      id: 'btn-stats',
      icon: statisticsIcon,
      label: t('mainMenu.statistics'),
      path: '/statistics',
    },
    {
      id: 'btn-quests',
      icon: questsIcon,
      label: t('mainMenu.quests'),
      path: '/quests',
    },
    {
      id: 'btn-achievements',
      icon: achievementsIcon,
      label: t('mainMenu.achievements', 'Achievements'),
      path: '/achievements',
    },
    {
      id: 'btn-guide',
      icon: guideIcon,
      label: t('mainMenu.guide'),
      path: '/guide',
    },
    {
      id: 'btn-help',
      icon: helpIcon,
      label: t('mainMenu.help'),
      path: '/help',
    },
    {
      id: 'btn-settings',
      icon: settingsIcon,
      label: t('mainMenu.settings'),
      path: '/settings',
    },
  ];

  const bannerRef = useRef<HTMLImageElement>(null);

  const handleBannerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 8; // Max 8 deg
    const rotateX = ((centerY - y) / centerY) * 8; // Max 8 deg

    bannerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleBannerMouseLeave = () => {
    if (!bannerRef.current) return;
    bannerRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  };

  if (isLoading)
    return (
      <div
        className="screen glass"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {t('common.loading')}
      </div>
    );

  return (
    <main className={`screen ${styles['main-menu']}`}>
      <div
        className={styles['main-menu__bg']}
        style={{
          backgroundImage: `url(${mainBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className={styles['main-menu__bg-overlay']} />

      <WoodyButton
        variant="brown"
        size="sm"
        className={`${styles['main-menu__news-btn']} ${styles['desktop-only']}`}
        title={t('mainMenu.news')}
        onClick={() => navigate('/news')}
        badge={hasUnread}
      >
        <img src={newsIcon} alt="News" />
      </WoodyButton>

      <div className={`${styles['main-menu__content']} fade-in`}>
        <div
          className={styles['main-menu__banner-container']}
          onMouseMove={handleBannerMouseMove}
          onMouseLeave={handleBannerMouseLeave}
        >
          <div className={styles['main-menu__rays']} />
          <img
            ref={bannerRef}
            src={bannerIcon}
            alt="Angler Simulator"
            className={styles['main-menu__banner']}
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
            }}
          />
        </div>

        <section className={`glass ${styles['main-menu__player']}`}>
          <div className={styles['main-menu__player-top']}>
            <img
              src={currentAvatarImg}
              alt="Profile"
              className={styles['main-menu__avatar-img']}
            />

            <div className={styles['main-menu__player-info']}>
              <div className={styles['main-menu__name-group']}>
                <div className={styles['main-menu__player-name']}>{name}</div>
                <EditButton
                  onClick={() => setIsProfileModalOpen(true)}
                  title={t('profile.editTitle')}
                />
              </div>
              <div className={styles['main-menu__player-meta']}>
                {t('mainMenu.level', { level })}
              </div>
              <div className={styles['main-menu__xp-bar']}>
                <div
                  className={styles['main-menu__xp-fill']}
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className={styles['main-menu__player-bottom']}>
            <div className={styles['main-menu__money']}>
              <img
                src={coinIcon}
                alt="coins"
                className={styles['main-menu__coin-icon']}
              />
              {money}
            </div>

            <WeatherStatus
              className={styles['main-menu__weather']}
              onClick={() => setIsWeatherModalOpen(true)}
              title={t('weather.viewForecast', 'View Forecast')}
            />

            <GameClock
              className={styles['main-menu__time']}
              iconClassName={styles['main-menu__clock-icon']}
              mode={'game'}
            />
          </div>
        </section>

        <nav className={styles['main-menu__nav']}>
          <WoodyButton
            id="btn-start-fishing"
            variant="green"
            size="lg"
            icon={boatIcon}
            label={t('mainMenu.startFishing')}
            onClick={() => dispatch(navigateTo('lakeSelect'))}
          />

          <div className={styles['main-menu__grid']}>
            {menuActions.map((item) => (
              <WoodyButton
                key={item.id}
                id={item.id}
                variant="brown"
                isTile={true}
                icon={item.icon}
                label={item.label}
                onClick={() => navigate(item.path)}
              />
            ))}
            <WoodyButton
              id="btn-news"
              variant="brown"
              isTile={true}
              icon={newsIcon}
              label={t('mainMenu.news')}
              mobileOnly={true}
              onClick={() => navigate('/news')}
              badge={hasUnread}
            />
          </div>

          <div className={styles['main-menu__footer-actions']}></div>
        </nav>
      </div>
      <Footer />

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={t('profile.editTitle')}
        showCloseButton={true}
        closeButtonVariant="wooden"
      >
        <ProfileEdit />
      </Modal>

      <WeatherForecastModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
      />
    </main>
  );
}
