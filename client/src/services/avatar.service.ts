import { supabase, AVATARS_BUCKET } from '@/common/configs/libs/supabase';

const AVATAR_SIZE = 256;

export class AvatarService {
  static MAX_FILE_SIZE = 5 * 1024 * 1024;
  static ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  static validateAvatar(file: File): string | null {
    if (!AvatarService.ALLOWED_TYPES.includes(file.type)) {
      return 'profile.avatarErrors.invalidType';
    }

    if (file.size > AvatarService.MAX_FILE_SIZE) {
      return 'profile.avatarErrors.tooLarge';
    }

    return null;
  }

  static async uploadAvatar(
    userId: string,
    file: File,
    oldAvatarUrl?: string | null,
  ): Promise<string> {
    const errorKey = AvatarService.validateAvatar(file);
    if (errorKey) {
      throw new Error(errorKey);
    }

    const resizedBlob = await AvatarService.resizeImage(file, AVATAR_SIZE);
    const filePath = `${userId}_${Date.now()}.webp`;

    const { error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(filePath, resizedBlob, {
        cacheControl: '3600',
        contentType: 'image/webp',
      });

    if (error) {
      console.error('Avatar upload error:', error);
      throw new Error('profile.avatarErrors.uploadFailed');
    }

    const { data: urlData } = supabase.storage
      .from(AVATARS_BUCKET)
      .getPublicUrl(filePath);

    if (oldAvatarUrl && supabase) {
      const { data: oldUrlData } = supabase.storage
        .from(AVATARS_BUCKET)
        .getPublicUrl('');
      const baseUrl = oldUrlData.publicUrl;

      if (oldAvatarUrl.startsWith(baseUrl)) {
        const oldFilePath = oldAvatarUrl.replace(baseUrl, '').split('?')[0];

        if (oldFilePath && oldFilePath !== filePath) {
          supabase.storage
            .from(AVATARS_BUCKET)
            .remove([oldFilePath])
            .catch((err) => console.error('Failed to delete old avatar:', err));
        }
      }
    }

    return `${urlData.publicUrl}?t=${Date.now()}`;
  }

  private static resizeImage(file: File, size: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/webp',
          0.85,
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }
}
