import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { DefaultButton } from '../UI/buttons/DefaultButton/DefaultButton';

import { AuthService } from '@/services/auth.service';

import styles from './AuthForm.module.css';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess: (message: string) => void;
}

export const ForgotPasswordForm = ({
  onBack,
  onSuccess,
}: ForgotPasswordFormProps) => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    mode: 'onSubmit',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { email: string }) =>
      AuthService.forgotPassword(data.email),
    onSuccess: (response) => {
      onSuccess(response.data.message || t('landing.forgotPassword.success'));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setServerError(
        error.response?.data?.message || 'landing.auth.errors.generic',
      );
    },
  });

  return (
    <form
      className={styles.authForm}
      onSubmit={handleSubmit((data) => mutate(data))}
      noValidate
      aria-label={t('landing.forgotPassword.title')}
    >
      <h2 className={styles.formTitle}>{t('landing.forgotPassword.title')}</h2>
      <p
        className={styles.formLabel}
        style={{ textAlign: 'center', marginBottom: '10px' }}
      >
        {t('landing.forgotPassword.subtitle')}
      </p>

      {serverError && (
        <div className={styles.serverError} role="alert">
          {t(serverError)}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="forgot-email" className={styles.formLabel}>
          {t('landing.login.email')}
        </label>
        <input
          id="forgot-email"
          type="email"
          className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
          placeholder="mail@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'forgot-email-error' : undefined}
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
            id="forgot-email-error"
            className={styles.errorMessage}
            role="alert"
          >
            {errors.email.message}
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
          {isPending ? t('common.loading') : t('landing.forgotPassword.submit')}
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
