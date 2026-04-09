import { $mainApi } from '@/http/axios';
import { clearLoggedOut } from '@/http/interceptors/auth.interceptor';

import type { ILoginResponse, IAuthForm, IUser } from '@/common/types';

export class AuthService {
  static async login(data: Omit<IAuthForm, 'confirmPassword' | 'username'>) {
    const response = await $mainApi.post<ILoginResponse>('/auth/login', data);
    return response;
  }

  static async register(data: IAuthForm) {
    const response = await $mainApi.post('/auth/register', data);
    return response;
  }

  static googleLogin() {
    const currentPath = window.location.pathname + window.location.search;
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    sessionStorage.removeItem('loggedOut');
    clearLoggedOut();

    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }

  static async refresh() {
    const response = await $mainApi.post<{ success: boolean }>('/auth/refresh');
    return response;
  }

  static async logout() {
    const response = await $mainApi.post<{ success: boolean; message: string }>(
      '/auth/logout',
    );
    return response;
  }

  static async forgotPassword(email: string, language?: string) {
    const response = await $mainApi.post<{ message: string }>(
      '/auth/forgot-password',
      { email, language },
    );
    return response;
  }

  static async resetPassword(data: {
    token: string;
    password: Omit<IAuthForm, 'confirmPassword' | 'username'>['password'];
  }) {
    const response = await $mainApi.post<{ success: boolean; message: string }>(
      '/auth/reset-password',
      data,
    );
    return response;
  }

  static async verifyResetToken(token: string) {
    const response = await $mainApi.post<{ sub: string; email: string }>(
      '/auth/verify-reset-token',
      { token },
    );
    return response;
  }

  static async getProfile() {
    const response = await $mainApi.get<IUser>('/auth/profile');
    return response;
  }
}
