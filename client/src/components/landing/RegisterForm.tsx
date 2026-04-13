import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';

import type { IAuthForm } from '@/common/types';

import { DefaultButton } from '@/components/UI/buttons/DefaultButton/DefaultButton';
import { EyeIconOpen, EyeIconClosed } from '@/components/UI/icons/EyeIcons';

import { useRegisterMutation } from '@/queries/auth.queries';

import styles from './AuthForm.module.css';

interface RegisterFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const RegisterForm = ({ onBack, onSuccess }: RegisterFormProps) => {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<IAuthForm>({
    mode: 'onSubmit',
  });

  const { mutate, isPending } = useRegisterMutation(
    () => {
      onSuccess();
    },
    (error: AxiosError<{ message: string }>) => {
      setServerError(
        error.response?.data?.message || 'landing.auth.errors.generic',
      );
    },
  );

  return (
    <form
      className={styles.authForm}
      onSubmit={handleSubmit((data) => {
        mutate({ ...data, language: i18n.language });
      })}
      noValidate
      autoComplete="off"
      aria-label={t('landing.register.title')}
    >
      <h2 className={styles.formTitle}>{t('landing.register.title')}</h2>

      {serverError && (
        <div className={styles.serverError} role="alert">
          {t(serverError)}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="reg-username" className={styles.formLabel}>
          {t('landing.register.username')}
        </label>
        <input
          id="reg-username"
          type="text"
          className={`${styles.formInput} ${errors.username ? styles.formInputError : ''}`}
          placeholder="Fisher_123"
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'reg-username-error' : undefined}
          {...register('username', {
            required: t('validation.required'),
            minLength: {
              value: 3,
              message: t('validation.minLength', { count: 3 }),
            },
          })}
        />
        {errors.username && (
          <span
            id="reg-username-error"
            className={styles.errorMessage}
            role="alert"
          >
            {errors.username.message}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="reg-email" className={styles.formLabel}>
          {t('landing.login.email')}
        </label>
        <input
          id="reg-email"
          type="email"
          className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
          placeholder="mail@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'reg-email-error' : undefined}
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
            id="reg-email-error"
            className={styles.errorMessage}
            role="alert"
          >
            {errors.email.message}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="reg-password" className={styles.formLabel}>
          {t('landing.login.password')}
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'reg-password-error' : undefined
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
            className={styles.eyeBtn}
            onClick={() => setShowPassword((p) => !p)}
            aria-label={
              showPassword
                ? t('landing.auth.hidePassword')
                : t('landing.auth.showPassword')
            }
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeIconClosed /> : <EyeIconOpen />}
          </button>
        </div>
        {errors.password && (
          <span
            id="reg-password-error"
            className={styles.errorMessage}
            role="alert"
          >
            {errors.password.message}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="reg-confirm-password" className={styles.formLabel}>
          {t('landing.register.confirmPassword')}
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="reg-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            className={`${styles.formInput} ${errors.confirmPassword ? styles.formInputError : ''}`}
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? 'reg-confirm-password-error' : undefined
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
            className={styles.eyeBtn}
            onClick={() => setShowConfirmPassword((p) => !p)}
            aria-label={
              showConfirmPassword
                ? t('landing.auth.hidePassword')
                : t('landing.auth.showPassword')
            }
            aria-pressed={showConfirmPassword}
          >
            {showConfirmPassword ? <EyeIconClosed /> : <EyeIconOpen />}
          </button>
        </div>
        {errors.confirmPassword && (
          <span
            id="reg-confirm-password-error"
            className={styles.errorMessage}
            role="alert"
          >
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <div className={styles.formActions}>
        <DefaultButton
          variant="primary"
          size="lg"
          type="submit"
          style={{ width: '100%' }}
          playSound={false}
          disabled={isPending}
        >
          {isPending ? t('common.loading') : t('landing.auth.register')}
        </DefaultButton>

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
