import { useAppDispatch } from './useAppStore';

import { clearAuth } from '@/store/slices/authSlice';
import { queryClient } from '@/common/configs/libs/reactQuery';

import { AuthService } from '@/services/auth.service';
import { setLoggedOut as setInterceptorLoggedOut } from '@/http/interceptors/auth.interceptor';

export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logout = async (hardRedirect = true) => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('[Auth] Logout request failed:', error);
    } finally {
      dispatch(clearAuth());

      setInterceptorLoggedOut();

      sessionStorage.setItem('loggedOut', 'true');
      localStorage.removeItem('hasSession');
      localStorage.removeItem('authExpiry');

      localStorage.removeItem('wfg_settings');
      localStorage.removeItem('fishing_session_data');

      queryClient.clear();

      if (hardRedirect) {
        window.location.replace('/welcome');
      }
    }
  };

  return { logout };
};
