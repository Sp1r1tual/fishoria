import { Outlet } from 'react-router';
import { SkeletonTheme } from 'react-loading-skeleton';

import { useServerErrorHandler } from '@/hooks/core/useServerErrorHandler';
import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import { LanguageSync } from '@/components/logic/LanguageSync';
import { AudioController } from '@/components/logic/AudioController';
import { SessionSync } from '@/components/logic/SessionSync';
import { ToastContainer } from '@/components/UI/Toast/ToastContainer';
import { PreloaderScreen } from '@/components/UI/Preloader/PreloaderScreen';

import { usePlayerQuery } from '@/queries/player.queries';
import { setGameAssetsLoaded } from '@/store/slices/uiSlice';

import 'react-loading-skeleton/dist/skeleton.css';

export default function App() {
  const dispatch = useAppDispatch();
  const { gameAssetsLoaded } = useAppSelector((state) => state.ui);

  const {
    isLoading: isProfileLoading,
    isError,
    error,
    refetch,
  } = usePlayerQuery();

  useServerErrorHandler(isError, error);

  if (!gameAssetsLoaded || isProfileLoading) {
    return (
      <SkeletonTheme baseColor="#202435" highlightColor="#47484967">
        <ToastContainer />
        <PreloaderScreen
          onComplete={() => dispatch(setGameAssetsLoaded(true))}
          error={isError}
          onRetry={() => refetch()}
        />
      </SkeletonTheme>
    );
  }

  return (
    <>
      <LanguageSync />
      <AudioController />
      <SessionSync />
      <SkeletonTheme baseColor="#202435" highlightColor="#47484967">
        <ToastContainer />
        <Outlet />
      </SkeletonTheme>
    </>
  );
}
