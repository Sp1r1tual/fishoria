import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { IPlayerProfile } from '@/common/types';

import { useClickSound } from '@/hooks/audio/useSoundEffect';
import { useIOSInputFix } from '@/hooks/ui/useIOSInputFix';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';

import { useUpdateProfileMutation } from '@/queries/player.queries';

import { AvatarService } from '@/services/avatar.service';

import { AVATARS, isExternalAvatarUrl } from '@/common/utils/avatar.util';

import styles from './ProfileEdit.module.css';

interface ProfileEditFormProps {
  player: IPlayerProfile;
}

export function ProfileEditForm({ player }: ProfileEditFormProps) {
  const playClick = useClickSound();
  const { t } = useTranslation();
  const updateProfileMutation = useUpdateProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { inputProps } = useIOSInputFix();

  const [username, setUsername] = useState(player.user.username || '');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const currentAvatar = player.user.avatar || 'profile_01.webp';
  const isCurrentExternal = isExternalAvatarUrl(currentAvatar);

  const [selectedAvatar, setSelectedAvatar] = useState(
    isCurrentExternal ? 'custom' : currentAvatar,
  );
  const [customPreview, setCustomPreview] = useState<string | null>(() => {
    if (isCurrentExternal) return currentAvatar;
    return localStorage.getItem(`last_custom_avatar_${player.user.id}`);
  });

  const [customFile, setCustomFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (customPreview && isExternalAvatarUrl(customPreview)) {
      localStorage.setItem(
        `last_custom_avatar_${player.user.id}`,
        customPreview,
      );
    }
  }, [customPreview, player.user.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const errorKey = AvatarService.validateAvatar(file);
    if (errorKey) {
      setUploadError(t(errorKey));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCustomPreview(previewUrl);
    setCustomFile(file);
    setSelectedAvatar('custom');
  };

  const handleSave = async () => {
    playClick();
    setUploadError(null);
    setUsernameError(null);

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setUsernameError(t('profile.errorLength'));
      return;
    }

    const nameRegex = /^[a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ\s-]+$/;
    if (!nameRegex.test(trimmedUsername)) {
      setUsernameError(t('profile.errorChars'));
      return;
    }

    let avatarValue = selectedAvatar;

    if (selectedAvatar === 'custom') {
      if (customFile) {
        try {
          setIsUploading(true);
          const publicUrl = await AvatarService.uploadAvatar(
            player.user.id,
            customFile,
            isCurrentExternal ? currentAvatar : undefined,
          );
          avatarValue = publicUrl;
          setCustomFile(null);
          setCustomPreview(publicUrl);
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : 'profile.avatarErrors.uploadFailed';
          setUploadError(t(message));
          return;
        } finally {
          setIsUploading(false);
        }
      } else if (customPreview) {
        avatarValue = customPreview;
      }
    }

    updateProfileMutation.mutate(
      { username: trimmedUsername, avatar: avatarValue },
      {
        onError: () => {
          setUsernameError(t('errors.unknown'));
        },
      },
    );
  };

  const isPending = updateProfileMutation.isPending || isUploading;

  const hasChanges =
    username.trim() !== (player.user.username || '') ||
    (selectedAvatar === 'custom' &&
      (customFile !== null || !isCurrentExternal)) ||
    (selectedAvatar !== 'custom' && selectedAvatar !== currentAvatar);

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>{t('profile.name')}</label>
        <input
          id="profile-username"
          name="username"
          className={styles.input}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (usernameError) setUsernameError(null);
          }}
          {...inputProps}
          placeholder={t('profile.namePlaceholder')}
          disabled={isPending}
          autoComplete="off"
        />
        {usernameError && (
          <div className={styles.errorText}>{usernameError}</div>
        )}
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

          {customPreview && (
            <div
              className={`${styles.avatarItem} ${selectedAvatar === 'custom' ? styles.avatarItemActive : ''}`}
              onClick={() => {
                if (isPending) return;
                playClick();
                setSelectedAvatar('custom');
              }}
            >
              <SkeletonImage
                src={customPreview}
                alt="Custom Avatar"
                className={styles.avatarImg}
                imgProps={{ referrerPolicy: 'no-referrer' }}
              />
            </div>
          )}

          <div
            className={`${styles.avatarItem} ${styles.avatarUpload}`}
            onClick={() => {
              if (isPending) return;
              playClick();
              fileInputRef.current?.click();
            }}
          >
            <div className={styles.uploadIcon}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className={styles.uploadLabel}>
              {t('profile.uploadAvatar')}
            </span>
          </div>
        </div>

        <p className={styles.note}>
          {t('profile.avatarErrors.avatarNotice')}
          <Link to="/terms">{t('profile.avatarErrors.avatarNoticeLink')}</Link>
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {uploadError && <div className={styles.errorText}>{uploadError}</div>}
      </div>

      <div className={styles.footer}>
        <WoodyButton
          variant="green"
          size="md"
          label={
            isUploading
              ? t('profile.uploading')
              : isPending
                ? t('profile.processing')
                : t('profile.save')
          }
          onClick={handleSave}
          disabled={isPending || !hasChanges || !username.trim()}
        />
      </div>
    </div>
  );
}
