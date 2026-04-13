import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useClickSound } from '@/hooks/audio/useSoundEffect';

import profile01 from '@/assets/ui/profile.webp';
import profile02 from '@/assets/ui/profile_02.webp';
import profile03 from '@/assets/ui/profile_03.webp';
import profile04 from '@/assets/ui/profile_04.webp';

import {
  usePlayerQuery,
  useUpdateProfileMutation,
} from '@/queries/player.queries';
import type { IPlayerProfile } from '@/common/types/player.types';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';

import styles from './ProfileEdit.module.css';

const AVATARS = [
  { id: 'profile.webp', img: profile01 },
  { id: 'profile_02.webp', img: profile02 },
  { id: 'profile_03.webp', img: profile03 },
  { id: 'profile_04.webp', img: profile04 },
];

export function ProfileEdit() {
  const { t } = useTranslation();
  const { data: player, isLoading } = usePlayerQuery();

  if (isLoading || !player) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  return <ProfileEditForm player={player} />;
}

function ProfileEditForm({ player }: { player: IPlayerProfile }) {
  const playClick = useClickSound();
  const { t } = useTranslation();
  const updateProfileMutation = useUpdateProfileMutation();

  const [username, setUsername] = useState(player.user.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    player.user.avatar || 'profile.webp',
  );

  const handleSave = () => {
    playClick();
    updateProfileMutation.mutate({ username, avatar: selectedAvatar });
  };

  const isPending = updateProfileMutation.isPending;
  const hasChanges =
    username !== (player.user.username || '') ||
    selectedAvatar !== (player.user.avatar || 'profile.webp');

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>{t('profile.name')}</label>
        <input
          id="profile-username"
          name="username"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('profile.namePlaceholder', 'Enter your name')}
          disabled={isPending}
          autoComplete="off"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>{t('profile.avatar')}</label>
        <div className={styles.avatarGrid}>
          {AVATARS.map((av) => (
            <div
              key={av.id}
              className={`${styles.avatarItem} ${selectedAvatar === av.id ? styles.avatarItemActive : ''}`}
              onClick={() => {
                if (isPending) return;
                playClick();
                setSelectedAvatar(av.id);
              }}
            >
              <img src={av.img} alt="Avatar" className={styles.avatarImg} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <WoodyButton
          variant="green"
          size="md"
          label={isPending ? t('common.processing') : t('common.save')}
          onClick={handleSave}
          disabled={isPending || !hasChanges || !username.trim()}
        />
      </div>
    </div>
  );
}
