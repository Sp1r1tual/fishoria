import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { PlayerService } from '../services/player.service';
import { refreshToken } from '../http/interceptors/auth.interceptor';

export const playerKeys = {
  all: ['player'] as const,
  profile: () => [...playerKeys.all, 'profile'] as const,
};

export const usePlayerQuery = () => {
  return useQuery({
    queryKey: playerKeys.profile(),
    queryFn: PlayerService.getProfile,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddMoneyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { amount: number; targetUserId?: string }) =>
      PlayerService.addMoney(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(playerKeys.profile(), data);
    },
  });
};

export const useResetProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PlayerService.resetProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
    },
  });
};

export const useUpdateLanguageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (language: string) => PlayerService.updateLanguage(language),
    onSuccess: async () => {
      // 1. Manually trigger a token refresh to update the JWT embedded with the new language
      await refreshToken().catch(() => null);

      // 2. Invalidate all queries that depend on language
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { username?: string; avatar?: string }) =>
      PlayerService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(playerKeys.profile(), data);
    },
  });
};
