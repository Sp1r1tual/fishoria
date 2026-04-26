import { Outlet } from 'react-router';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { useAppInit } from '@/hooks/core/useAppInit';

import { LanguageSync } from '@/components/logic/LanguageSync';
import { AudioController } from '@/components/logic/AudioController';
import { SessionSync } from '@/components/logic/SessionSync';
import { GlobalModals } from '@/components/logic/GlobalModals';
import { PreloaderScreen } from '@/components/UI/Preloader/PreloaderScreen';

function App() {
  const { isInitializing, isError, refetch, setLoaded } = useAppInit();

  return (
    <SkeletonTheme baseColor="#202435" highlightColor="#47484967">
      {isInitializing ? (
        <PreloaderScreen
          onComplete={setLoaded}
          error={isError}
          onRetry={refetch}
        />
      ) : (
        <>
          <LanguageSync />
          <AudioController />
          <SessionSync />
          <GlobalModals />
          <Outlet />
        </>
      )}
    </SkeletonTheme>
  );
}

export default App;
