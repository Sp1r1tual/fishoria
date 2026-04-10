import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { AxiosError } from 'axios';

import type { ILoginResponse, IAuthForm } from '@/common/types';

import { DefaultButton } from '../UI/buttons/DefaultButton/DefaultButton';

import { useLoginMutation } from '@/queries/auth.queries';

import styles from './AuthForm.module.css';

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

interface LoginFormProps {
  onBack: () => void;
  onForgotPassword: () => void;
  onSuccess: (data: ILoginResponse) => void;
  onRegister: () => void;
}

export const LoginForm = ({
  onBack,
  onForgotPassword,
  onSuccess,
  onRegister,
}: LoginFormProps) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const isActivated = searchParams.get('activated') === 'true';
  const activationError = searchParams.get('activationError') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IAuthForm>({
    mode: 'onSubmit',
  });

  const { mutate, isPending } = useLoginMutation(
    (data) => onSuccess(data),
    (error: AxiosError<{ message: string }>) => {
      setServerError(
        error.response?.data?.message || 'landing.auth.errors.generic',
      );
    },
  );

  return (
    <form
      className={styles.authForm}
      onSubmit={handleSubmit((data) => mutate(data))}
      noValidate
      autoComplete="off"
      aria-label={t('landing.login.title')}
    >
      <h2 className={styles.formTitle}>{t('landing.login.title')}</h2>

      {isActivated && !serverError && (
        <div className={styles.serverSuccess} role="status">
          {t('landing.auth.errors.accountActivated')}
        </div>
      )}

      {activationError && !serverError && (
        <div className={styles.serverError} role="alert">
          {t('landing.auth.errors.invalidActivationLink')}
        </div>
      )}

      {serverError && (
        <div className={styles.serverError} role="alert">
          {t(serverError)}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="login-email" className={styles.formLabel}>
          {t('landing.login.email')}
        </label>
        <input
          id="login-email"
          type="email"
          className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
          placeholder="mail@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email', {
            required: t('validation.required'),
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('validation.emailFormat'),
            },
          })}
        />
        {errors.email && (
          <span
            id="login-email-error"
            className={styles.errorMessage}
            role="alert"
          >
            {errors.email.message}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="login-password" className={styles.formLabel}>
          {t('landing.login.password')}
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'login-password-error' : undefined
            }
            autoComplete="off"
            {...register('password', {
              required: t('validation.required'),
            })}
          />
          <button
            type="button"
            className={styles.eyeBtn}
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
            id="login-password-error"
            className={styles.errorMessage}
            role="alert"
          >
            {errors.password.message}
          </span>
        )}
      </div>

      <div className={styles.formActions}>
        <DefaultButton
          size="lg"
          type="submit"
          style={{ width: '100%' }}
          playSound={false}
          disabled={isPending}
        >
          {isPending ? t('common.loading') : t('landing.auth.login')}
        </DefaultButton>

        <button
          type="button"
          className={styles.forgotPassword}
          onClick={onForgotPassword}
        >
          {t('landing.login.forgot')}
        </button>

        <button
          type="button"
          className={styles.forgotPassword}
          onClick={onRegister}
        >
          {t('landing.auth.noAccount')}
        </button>

        <button
          type="button"
          className={styles.forgotPassword}
          onClick={onBack}
        >
          {t('landing.login.back')}
        </button>
      </div>
    </form>
  );
};
