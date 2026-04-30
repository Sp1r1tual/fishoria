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
import { isPublicRoute, PUBLIC_ROUTES } from '@/common/constants/routes';

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

      const isPublicPath = isPublicRoute(location.pathname);

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
        const data = await queryClient.fetchQuery({
          queryKey: PLAYER_KEYS.profile(),
          queryFn: () => PlayerService.getProfile(),
          staleTime: 5 * 60 * 1000,
        });

        dispatch(setUser(data.user));
        localStorage.setItem('hasSession', 'true');

        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (
          redirectPath &&
          !(PUBLIC_ROUTES as readonly string[]).includes(redirectPath)
        ) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        }
      } catch (error) {
        console.error('[AuthLayout] Initialization failed:', error);

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : null;

        const isBan =
          status === 403 &&
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message === 'ACCOUNT_BANNED';

        if (isBan) {
          localStorage.removeItem('hasSession');
          localStorage.removeItem('authExpiry');
          dispatch(clearAuth());
          return;
        }

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
