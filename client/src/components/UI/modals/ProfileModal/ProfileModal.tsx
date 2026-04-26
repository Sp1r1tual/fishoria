import { useTranslation } from 'react-i18next';

import type { IPlayerProfile, UserRole } from '@/common/types';

import { Modal } from '../Modal/Modal';
import { SkeletonImage } from '../../skeletons/SkeletonImage/SkeletonImage';
import { ErrorView } from '@/components/UI/ErrorView/ErrorView';
import { ProfileSkeleton } from './ProfileSkeleton';

import { resolveAvatarImg } from '@/common/utils/avatar.util';
import { formatNumericDate } from '@/common/utils/date.util';

import styles from './ProfileModal.module.css';

interface IProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: IPlayerProfile | null;
  isError?: boolean;
}

export function ProfileModal({
  isOpen,
  onClose,
  player,
  isError = false,
}: IProfileModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const playerUser = player?.user;
  const level = player?.level;
  const createdAt = player?.createdAt;

  const avatarImg = playerUser
    ? resolveAvatarImg(playerUser.avatar || 'profile_01.webp')
    : '';

  const joinDate =
    createdAt || playerUser?.createdAt
      ? formatNumericDate(createdAt || playerUser?.createdAt)
      : '';

  const roleKey = (playerUser?.role as UserRole) || 'PLAYER';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('profile.playerProfile')}
      showCloseButton={true}
      closeButtonVariant="wooden"
      maxWidth="420px"
    >
      <div className={styles.container}>
        {isError ? (
          <ErrorView message={t('profile.errorLoading')} />
        ) : !player ? (
          <ProfileSkeleton />
        ) : (
          <>
            <div className={styles.top}>
              <a
                href={avatarImg}
                target="_blank"
                rel="noreferrer"
                className={styles.avatarLink}
                title={t('profile.viewOriginalAvatar', 'View original avatar')}
              >
                <div className={styles.avatarWrapper}>
                  <SkeletonImage
                    src={avatarImg}
                    alt={player.user.username}
                    className={styles.avatar}
                    imgProps={{ referrerPolicy: 'no-referrer' }}
                  />
                </div>
              </a>
              <div className={styles.mainInfo}>
                <div className={styles.name}>{player.user.username}</div>
                <div
                  className={`${styles.roleBadge} ${styles[`role_${roleKey}`]}`}
                >
                  {t(`profile.roles.${roleKey}`)}
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>{t('profile.level')}</span>
                <span className={styles.statValue}>{level}</span>
              </div>

              <div className={styles.statItem}>
                <span className={styles.statLabel}>
                  {t('mainMenu.achievements')}
                </span>
                <span className={styles.statValue}>
                  {player.playerAchievements?.length || 0}
                </span>
              </div>

              <div className={styles.statItem}>
                <span className={styles.statLabel}>
                  {t('profile.joinedAt')}
                </span>
                <span className={styles.statValue}>{joinDate}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
