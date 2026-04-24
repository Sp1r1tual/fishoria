import { useEffect } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
  useSearchParams,
} from 'react-router';
import { useTranslation } from 'react-i18next';

import { useAppSelector, useAppDispatch } from '../hooks/core/useAppStore';
import { useAuthInitialization } from '../hooks/core/useAuthInitialization';
import { addToast } from '@/store/slices/uiSlice';

import { GlobalPreloader } from '@/components/UI/GlobalPreloader/GlobalPreloader';
import { ScrollToTop } from '@/components/UI/ScrollToTop/ScrollToTop';
import { RouteMetadata } from '@/components/logic/RouteMetadata';
import { CookieConsent } from '@/components/CookieConsent/CookieConsent';
import { ToastContainer } from '@/components/UI/Toast/ToastContainer';

export const AuthLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const [searchParams] = useSearchParams();

  useAuthInitialization();

  useEffect(() => {
    const wasBanned = sessionStorage.getItem('banned');
    const banReason = sessionStorage.getItem('ban_reason');
    if (wasBanned) {
      sessionStorage.removeItem('banned');
      sessionStorage.removeItem('ban_reason');
      dispatch(
        addToast({
          type: 'error',
          message: `${t('landing.auth.errors.accountBanned')}${banReason && banReason !== 'No reason provided' ? `: ${banReason}` : ''}`,
          duration: 6000,
        }),
      );
    }
  }, [dispatch, t]);

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
      <ToastContainer />
      <Outlet />
      <CookieConsent />
    </>
  );
};
