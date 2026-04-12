import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { AuthService } from '@/services/auth.service';
import { DefaultButton } from '@/components/UI/buttons/DefaultButton/DefaultButton';

import authStyles from './AuthForm.module.css';

const EyeIconOpen = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeIconClosed = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { password: string }) =>
      AuthService.resetPassword({
        token: token || '',
        password: data.password,
      }),
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setServerError(
        error.response?.data?.message || 'landing.auth.errors.generic',
      );
    },
  });

  const tokenError = !token ? 'landing.auth.errors.invalidResetToken' : null;
  const activeError = serverError || tokenError;

  if (isSuccess) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          textAlign: 'center',
          maxWidth: '520px',
        }}
      >
        <h1 className={authStyles.formTitle}>
          {t('landing.resetPassword.successTitle', 'Password Reset!')}
        </h1>
        <p className={authStyles.successMessage}>
          {t(
            'landing.resetPassword.successText',
            'Your password has been successfully updated. You can now log in with your new password.',
          )}
        </p>
        <DefaultButton
          variant="primary"
          size="lg"
          onClick={() => navigate('/')}
          style={{ marginTop: '20px' }}
        >
          {t('landing.auth.backToLogin', 'Go to Login')}
        </DefaultButton>
      </div>
    );
  }

  return (
    <form
      className={authStyles.authForm}
      onSubmit={handleSubmit((data) => mutate(data))}
      noValidate
      autoComplete="off"
      aria-label={t('landing.resetPassword.title', 'Reset Password')}
      style={{ maxWidth: '520px' }}
    >
      <h1 className={authStyles.formTitle}>
        {t('landing.resetPassword.title', 'Reset Password')}
      </h1>

      {activeError && (
        <div className={authStyles.serverError} role="alert">
          {t(activeError)}
        </div>
      )}

      <div className={authStyles.formGroup}>
        <label htmlFor="reset-password" className={authStyles.formLabel}>
          {t('landing.login.password')}
        </label>
        <div className={authStyles.passwordWrapper}>
          <input
            id="reset-password"
            type={showPassword ? 'text' : 'password'}
            className={`${authStyles.formInput} ${errors.password ? authStyles.formInputError : ''}`}
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'reset-password-error' : undefined
            }
            autoComplete="off"
            {...register('password', {
              required: t('validation.required'),
              minLength: {
                value: 8,
                message: t('validation.minLength'),
              },
            })}
          />
          <button
            type="button"
            className={authStyles.eyeBtn}
            onClick={() => setShowPassword((p) => !p)}
            aria-label={
              showPassword
                ? t('landing.auth.hidePassword', 'Hide password')
                : t('landing.auth.showPassword', 'Show password')
            }
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeIconClosed /> : <EyeIconOpen />}
          </button>
        </div>
        {errors.password && (
          <span
            id="reset-password-error"
            className={authStyles.errorMessage}
            role="alert"
          >
            {errors.password.message}
          </span>
        )}
      </div>

      <div className={authStyles.formGroup}>
        <label
          htmlFor="reset-confirm-password"
          className={authStyles.formLabel}
        >
          {t('landing.register.confirmPassword')}
        </label>
        <div className={authStyles.passwordWrapper}>
          <input
            id="reset-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            className={`${authStyles.formInput} ${errors.confirmPassword ? authStyles.formInputError : ''}`}
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword
                ? 'reset-confirm-password-error'
                : undefined
            }
            autoComplete="off"
            {...register('confirmPassword', {
              required: t('validation.required'),
              validate: (val) =>
                getValues('password') === val || t('validation.mismatch'),
            })}
          />
          <button
            type="button"
            className={authStyles.eyeBtn}
            onClick={() => setShowConfirmPassword((p) => !p)}
            aria-label={
              showConfirmPassword
                ? t('landing.auth.hidePassword', 'Hide password')
                : t('landing.auth.showPassword', 'Show password')
            }
            aria-pressed={showConfirmPassword}
          >
            {showConfirmPassword ? <EyeIconClosed /> : <EyeIconOpen />}
          </button>
        </div>
        {errors.confirmPassword && (
          <span
            id="reset-confirm-password-error"
            className={authStyles.errorMessage}
            role="alert"
          >
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <div className={authStyles.formActions}>
        <DefaultButton
          variant="primary"
          size="lg"
          type="submit"
          style={{ width: '100%' }}
          disabled={isPending || !token}
        >
          {isPending
            ? t('common.loading')
            : t('landing.resetPassword.submit', 'Update Password')}
        </DefaultButton>
      </div>
    </form>
  );
};
