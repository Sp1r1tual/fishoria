import profile01 from '@/assets/ui/profile_01.webp';
import profile02 from '@/assets/ui/profile_02.webp';
import profile03 from '@/assets/ui/profile_03.webp';
import profile04 from '@/assets/ui/profile_04.webp';
import profile05 from '@/assets/ui/profile_05.webp';
import profile06 from '@/assets/ui/profile_06.webp';

export const AVATARS = [
  { id: 'profile_01.webp', img: profile01 },
  { id: 'profile_02.webp', img: profile02 },
  { id: 'profile_03.webp', img: profile03 },
  { id: 'profile_04.webp', img: profile04 },
  { id: 'profile_05.webp', img: profile05 },
  { id: 'profile_06.webp', img: profile06 },
];

export const avatarMap: Record<string, string> = AVATARS.reduce(
  (acc, avatar) => {
    acc[avatar.id] = avatar.img;
    return acc;
  },
  {} as Record<string, string>,
);

export function isExternalAvatarUrl(
  avatar: string | null | undefined,
): boolean {
  if (!avatar) return false;
  return avatar.startsWith('http://') || avatar.startsWith('https://');
}

export function resolveAvatarImg(avatar: string | null | undefined): string {
  if (!avatar) return profile01;
  if (isExternalAvatarUrl(avatar)) return avatar;
  return avatarMap[avatar] || profile01;
}
