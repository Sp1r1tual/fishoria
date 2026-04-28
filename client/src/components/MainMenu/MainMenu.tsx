import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useNewsState } from '@/hooks/game/useNewsState';

import { Footer } from '../Footer/Footer';
import { Modal } from '../UI/modals/Modal/Modal';
import { ProfileEdit } from '../ProfileEdit/ProfileEdit';
import { GameClock } from '../UI/GameClock/GameClock';
import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { EditButton } from '../UI/buttons/EditButton/EditButton';
import { WeatherStatus } from '../UI/WeatherStatus/WeatherStatus';
import { OnlineDot } from '../UI/OnlineDot/OnlineDot';
import { Fireflies } from '../Effects/Fireflies/Fireflies';
import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';
import { PlayerSkeleton } from './PlayerSkeleton';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import {
  navigateTo,
  openProfileModal,
  openWeatherModal,
} from '@/store/slices/uiSlice';
import { usePlayerQuery } from '@/queries/player.queries';

import { getXpNeededForLevel } from '@/common/utils/experience.util';
import { resolveAvatarImg } from '@/common/utils/avatar.util';
import { getMenuActions } from './MainMenu.config';

import mainBg from '@/assets/ui/main_menu_background.webp';
import coinIcon from '@/assets/ui/coin.webp';
import boatIcon from '@/assets/ui/boat.webp';
import newsIcon from '@/assets/ui/news.webp';

import styles from './MainMenu.module.css';

export function MainMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: player, isLoading } = usePlayerQuery();
  const { hasUnread } = useNewsState();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { t } = useTranslation();

  const connectionStatus = useAppSelector((s) => s.online.connectionStatus);
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);

  const level = player?.level ?? 1;
  const xp = player?.xp ?? 0;
  const money = player?.money ?? 0;
  const name = player?.user?.username ?? 'Angler';
  const avatar = player?.user?.avatar ?? 'profile_01.webp';

  const currentAvatarImg = resolveAvatarImg(avatar);

  const xpNeeded = getXpNeededForLevel(level);
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);

  const menuActions = getMenuActions(t);

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
      >
        <Fireflies count={25} spawnRangeY={[45, 90]} />
      </div>
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
        {isLoading ? (
          <PlayerSkeleton />
        ) : (
          <section className={`glass ${styles['main-menu__player']}`}>
            <div className={styles['main-menu__player-top']}>
              <SkeletonImage
                src={currentAvatarImg}
                alt="Profile"
                className={styles['main-menu__avatar-img']}
                wrapperClassName={styles['main-menu__avatar-img']}
                imgProps={{
                  referrerPolicy: 'no-referrer',
                  onClick: () =>
                    dispatch(openProfileModal({ player: player || null })),
                }}
              />

              <div className={styles['main-menu__player-info']}>
                <div className={styles['main-menu__name-group']}>
                  <div
                    className={styles['main-menu__player-name']}
                    onClick={() => {
                      dispatch(openProfileModal({ player: player || null }));
                    }}
                  >
                    {name}
                  </div>
                  <EditButton
                    onClick={() => setIsProfileModalOpen(true)}
                    title={t('profile.editTitle')}
                  />
                  {onlineMode && (
                    <OnlineDot
                      status={connectionStatus}
                      className={styles['main-menu__online-dot']}
                    />
                  )}
                </div>
                <div className={styles['main-menu__level-row']}>
                  <div className={styles['main-menu__player-meta']}>
                    {t('mainMenu.level', { level })}
                  </div>
                  <div className={styles['main-menu__xp-counter']}>
                    {Math.floor(xp)} / {xpNeeded}
                  </div>
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
                onClick={() => dispatch(openWeatherModal())}
                title={t('weather.viewForecast', 'View Forecast')}
              />

              <GameClock
                className={styles['main-menu__time']}
                iconClassName={styles['main-menu__clock-icon']}
                mode={'game'}
              />
            </div>
          </section>
        )}

        <nav className={styles['main-menu__nav']}>
          <WoodyButton
            id="btn-start-fishing"
            variant="green"
            size="lg"
            icon={boatIcon}
            label={t('mainMenu.startFishing')}
            onClick={() => dispatch(navigateTo('lakeSelect'))}
            isShining={true}
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
        </nav>
      </div>
      <div className={styles['main-menu__footer-wrapper']}>
        <Footer />
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={t('profile.editTitle')}
        showCloseButton={true}
        closeButtonVariant="wooden"
      >
        <ProfileEdit />
      </Modal>
    </main>
  );
}
