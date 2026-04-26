import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { ACHIEVEMENT_KEYS } from './achievement.queries';
import { QUEST_KEYS } from './quest.queries';
import { INVENTORY_KEYS } from './inventory.queries';
import { NEWS_KEYS } from './news.queries';

import { PlayerService } from '../services/player.service';
import { refreshToken } from '../http/interceptors/auth.interceptor';
import { useAppSelector } from '../hooks/core/useAppStore';

export const PLAYER_KEYS = {
  all: ['player'] as const,
  profile: () => [...PLAYER_KEYS.all, 'profile'] as const,
  otherProfile: (userId: string) =>
    [...PLAYER_KEYS.all, 'profile', userId] as const,
};

export const usePlayerQuery = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { i18n } = useTranslation();
  const language = i18n.language;

  return useQuery({
    queryKey: PLAYER_KEYS.profile(),
    queryFn: () => PlayerService.getProfile(language),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  });
};

export const useOtherPlayerQuery = (userId: string | null) => {
  return useQuery({
    queryKey: PLAYER_KEYS.otherProfile(userId || ''),
    queryFn: () =>
      userId
        ? PlayerService.getOtherProfile(userId)
        : Promise.reject('No userId provided'),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddMoneyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { amount: number; targetUserId?: string }) =>
      PlayerService.addMoney(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PLAYER_KEYS.profile(), data);
    },
  });
};

export const useResetProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PlayerService.resetProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_KEYS.all });
    },
  });
};

export const useUpdateLanguageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (language: string) => PlayerService.updateLanguage(language),
    onSuccess: async () => {
      await refreshToken().catch(() => null);

      queryClient.invalidateQueries({ queryKey: PLAYER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUEST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.all });
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { username?: string; avatar?: string }) =>
      PlayerService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PLAYER_KEYS.profile(), data);
    },
  });
};
