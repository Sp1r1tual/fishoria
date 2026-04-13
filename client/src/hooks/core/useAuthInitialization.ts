import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useAppDispatch, useAppSelector } from './useAppStore';
import {
  clearAuth,
  setInitialized,
  setLoading,
  setUser,
  logout,
} from '@/store/slices/authSlice';
import { PLAYER_KEYS } from '@/queries/player.queries';

import { PlayerService } from '@/services/player.service';

export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
        // Use fetchQuery to populate React Query cache and avoid double request
        const data = await queryClient.fetchQuery({
          queryKey: PLAYER_KEYS.profile(),
          queryFn: PlayerService.getProfile,
          staleTime: 5 * 60 * 1000,
        });

        // Use the user info from the player profile to initialize auth state
        dispatch(setUser(data.user));
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
  }, [
    dispatch,
    isInitialized,
    navigate,
    location.pathname,
    searchParams,
    queryClient,
  ]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      const wasLoggedOut = sessionStorage.getItem('loggedOut') === 'true';

      if (event.persisted && wasLoggedOut) {
        dispatch(logout());
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [dispatch]);
};
