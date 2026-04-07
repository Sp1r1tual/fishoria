import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';

import { useAppDispatch, useAppSelector } from './useAppStore';
import {
  clearAuth,
  setInitialized,
  setLoading,
  setUser,
} from '../../store/slices/authSlice';

import { setLoggedOut as setInterceptorLoggedOut } from '../../http/interceptors/auth.interceptor';
import { AuthService } from '../../services/auth.service';

export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { isInitialized } = useAppSelector((state) => state.auth);
  const initRef = useRef(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;

      const isPublicPath =
        location.pathname === '/reset-password' ||
        location.pathname === '/welcome' ||
        location.pathname === '/privacy' ||
        location.pathname === '/terms';

      // When visiting an activation link — skip session restore entirely.
      // The activation flow should always land on a clean login form,
      // regardless of any existing session in the browser.
      const isActivationFlow = searchParams.get('activated') === 'true';

      if (
        isPublicPath &&
        (!localStorage.getItem('hasSession') || isActivationFlow)
      ) {
        dispatch(setInitialized());
        return;
      }

      dispatch(setLoading());

      try {
        const response = await AuthService.getProfile();

        dispatch(setUser(response.data));
        localStorage.setItem('hasSession', 'true');

        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (
          redirectPath &&
          redirectPath !== '/welcome' &&
          redirectPath !== '/reset-password' &&
          redirectPath !== '/privacy' &&
          redirectPath !== '/terms'
        ) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        }
      } catch (error) {
        console.error('[AuthLayout] Initialization failed:', error);

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : null;
        const isAuthError = status === 401 || status === 403 || status === 404;

        if (isAuthError) {
          localStorage.removeItem('hasSession');
          localStorage.removeItem('authExpiry');
          dispatch(clearAuth());
        } else if (!status || (status && status >= 500)) {
          navigate('/server-unavailable');
        }
      } finally {
        dispatch(setInitialized());
      }
    };

    if (!initRef.current) {
      initRef.current = true;
      initializeAuth();
    }
  }, [dispatch, isInitialized, navigate, location.pathname, searchParams]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      const wasLoggedOut = sessionStorage.getItem('loggedOut') === 'true';

      if (event.persisted && wasLoggedOut) {
        setInterceptorLoggedOut();
        dispatch(clearAuth());
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [dispatch]);
};
