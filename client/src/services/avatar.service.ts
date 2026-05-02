import { $mainApi } from '@/http/axios';

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

  static async uploadAvatar(file: File): Promise<string> {
    const errorKey = AvatarService.validateAvatar(file);
    if (errorKey) {
      throw new Error(errorKey);
    }

    const resizedBlob = await AvatarService.resizeImage(file, AVATAR_SIZE);

    const formData = new FormData();
    formData.append('file', resizedBlob, 'avatar.webp');

    try {
      const { data } = await $mainApi.post<{ publicUrl: string }>(
        '/player/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return data.publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new Error('profile.avatarErrors.uploadFailed');
    }
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
