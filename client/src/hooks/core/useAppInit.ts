import { useServerErrorHandler } from './useServerErrorHandler';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { usePlayerQuery } from '@/queries/player.queries';
import { setGameAssetsLoaded } from '@/store/slices/uiSlice';

export function useAppInit() {
  const dispatch = useAppDispatch();
  const { gameAssetsLoaded } = useAppSelector((state) => state.ui);

  const {
    isLoading: isProfileLoading,
    isError,
    error,
    refetch,
  } = usePlayerQuery();

  useServerErrorHandler(isError, error);

  const setLoaded = () => dispatch(setGameAssetsLoaded(true));

  return {
    isInitializing: !gameAssetsLoaded || isProfileLoading,
    isError,
    refetch,
    setLoaded,
  };
}
