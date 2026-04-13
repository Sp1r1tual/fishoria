import { useAppDispatch } from './useAppStore';
import { logout } from '@/store/slices/authSlice';

import { AuthService } from '@/services/auth.service';

import { queryClient } from '@/common/configs/libs/reactQuery';

export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logoutAction = async (hardRedirect = true) => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('[Auth] Logout request failed:', error);
    } finally {
      dispatch(logout());

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

  return { logout: logoutAction };
};
