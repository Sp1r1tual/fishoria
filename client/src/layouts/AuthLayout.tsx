import { useEffect } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
  useSearchParams,
} from 'react-router';

import { useAppSelector } from '../hooks/core/useAppStore';
import { useAuthInitialization } from '../hooks/core/useAuthInitialization';

import { GlobalPreloader } from '@/components/UI/GlobalPreloader/GlobalPreloader';
import { ScrollToTop } from '@/components/UI/ScrollToTop/ScrollToTop';
import { RouteMetadata } from '@/components/logic/RouteMetadata';
import { CookieConsent } from '@/components/CookieConsent/CookieConsent';

export const AuthLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const [searchParams] = useSearchParams();

  useAuthInitialization();

  useEffect(() => {
    const isActivationFlow = searchParams.get('activated') === 'true';

    if (
      isInitialized &&
      isAuthenticated &&
      !isActivationFlow &&
      (location.pathname === '/welcome' ||
        location.pathname === '/reset-password')
    ) {
      navigate('/');
    }
  }, [
    isInitialized,
    isAuthenticated,
    location.pathname,
    navigate,
    searchParams,
  ]);

  if (!isInitialized) return <GlobalPreloader />;

  const wasLoggedOut = sessionStorage.getItem('loggedOut') === 'true';

  if (!isAuthenticated || wasLoggedOut) {
    const isPublicPath =
      location.pathname === '/welcome' ||
      location.pathname === '/reset-password' ||
      location.pathname === '/privacy' ||
      location.pathname === '/terms';

    if (!isPublicPath) {
      return <Navigate to="/welcome" replace />;
    }
  }

  return (
    <>
      <RouteMetadata />
      <ScrollToTop />
      <Outlet />
      <CookieConsent />
    </>
  );
};
