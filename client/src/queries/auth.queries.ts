import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import type { IAuthForm, ILoginResponse } from '@/common/types';

import { AuthService } from '@/services/auth.service';

export const useLoginMutation = (
  onSuccess: (data: ILoginResponse) => void,
  onError: (error: AxiosError<{ message: string }>) => void,
) => {
  return useMutation({
    mutationFn: (data: IAuthForm) =>
      AuthService.login(data).then((res) => res.data),
    onSuccess,
    onError,
  });
};

export const useRegisterMutation = (
  onSuccess: () => void,
  onError: (error: AxiosError<{ message: string }>) => void,
) => {
  return useMutation({
    mutationFn: (data: IAuthForm) =>
      AuthService.register(data).then((res) => res.data),
    onSuccess,
    onError,
  });
};
