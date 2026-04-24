import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToast } from '@/store/slices/uiSlice';

import type { ILoginResponse } from '@/common/types';

import { DefaultButton } from '@/components/UI/buttons/DefaultButton/DefaultButton';
import { LoginForm } from '@/components/landing/LoginForm';
import { RegisterForm } from '@/components/landing/RegisterForm';
import { ForgotPasswordForm } from '@/components/landing/ForgotPasswordForm';

import { setUser } from '@/store/slices/authSlice';
import { type AppDispatch } from '@/store/store';

import { AuthService } from '@/services/auth.service';

import googleIcon from '@/assets/landing/google.webp';

import styles from './AuthBox.module.css';

type AuthMode = 'selection' | 'login' | 'register' | 'forgot' | 'success';

interface AuthBoxProps {
  onModeChange?: (mode: AuthMode) => void;
}

export const AuthBox = ({ onModeChange }: AuthBoxProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>(() =>
    searchParams.get('activated') === 'true' ||
    searchParams.get('activationError') === 'true'
      ? 'login'
      : 'selection',
  );
  const [successMessage, setSuccessMessage] = useState('');

  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (!hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      if (authMode !== 'selection' && onModeChange) {
        onModeChange(authMode);
      }
    }
  }, [authMode, onModeChange]);

  const hasNotifiedErrorRef = useRef(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error && !hasNotifiedErrorRef.current) {
      hasNotifiedErrorRef.current = true;

      let toastMsg = t(error);
      if (error.startsWith('landing.auth.errors.accountBanned:::')) {
        const reason = error.split(':::')[1];
        toastMsg = `${t('landing.auth.errors.accountBanned')}: ${reason}`;
      }

      dispatch(addToast({ message: toastMsg, type: 'error' }));

      const newParams = new URLSearchParams(searchParams);

      newParams.delete('error');

      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [searchParams, dispatch, t, navigate]);

  const handleModeChange = useCallback(
    (newMode: AuthMode) => {
      setAuthMode(newMode);
      if (onModeChange) {
        onModeChange(newMode);
      }
    },
    [onModeChange],
  );

  const handleLoginSuccess = (data: ILoginResponse) => {
    sessionStorage.removeItem('loggedOut');
    localStorage.setItem('hasSession', 'true');
    dispatch(setUser(data.user));

    const redirect = sessionStorage.getItem('redirectAfterLogin') || '/';
    sessionStorage.removeItem('redirectAfterLogin');
    navigate(redirect);
  };

  const handleRegisterSuccess = () => {
    setSuccessMessage('landing.register.success');
    handleModeChange('success');
  };

  const handleForgotSuccess = (message: string) => {
    setSuccessMessage(message);
    handleModeChange('success');
  };

  return (
    <section
      className={styles.authBox}
      aria-label={t('landing.auth.ariaLabel', 'Authentication')}
    >
      {authMode === 'selection' && (
        <div
          className={styles.authButtons}
          role="group"
          aria-label={t(
            'landing.auth.methodsAriaLabel',
            'Sign in or create account',
          )}
        >
          <DefaultButton
            size="lg"
            playSound={false}
            onClick={() => handleModeChange('login')}
          >
            {t('landing.auth.login')}
          </DefaultButton>
          <DefaultButton
            variant="secondary"
            size="lg"
            playSound={false}
            onClick={() => handleModeChange('register')}
          >
            {t('landing.auth.register')}
          </DefaultButton>

          <div className={styles.divider}>
            <span>{t('landing.or_continue_with')}</span>
          </div>

          <DefaultButton
            variant="google"
            size="lg"
            playSound={false}
            onClick={() => AuthService.googleLogin()}
          >
            <img src={googleIcon} alt="Google" className={styles.googleIcon} />
            {t('landing.auth.google_short', 'Google')}
          </DefaultButton>
        </div>
      )}

      {authMode === 'login' && (
        <div className={styles.animateContainer}>
          <LoginForm
            onSuccess={handleLoginSuccess}
            onForgotPassword={() => handleModeChange('forgot')}
            onRegister={() => handleModeChange('register')}
            onBack={() => handleModeChange('selection')}
          />
        </div>
      )}

      {authMode === 'register' && (
        <div className={styles.animateContainer}>
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onBack={() => handleModeChange('selection')}
          />
        </div>
      )}

      {authMode === 'forgot' && (
        <div className={styles.animateContainer}>
          <ForgotPasswordForm
            onSuccess={handleForgotSuccess}
            onBack={() => handleModeChange('login')}
          />
        </div>
      )}

      {authMode === 'success' && (
        <div className={styles.successBox} role="status" aria-live="polite">
          <p className={styles.successMessage}>{t(successMessage)}</p>
          <DefaultButton
            size="lg"
            playSound={false}
            onClick={() => handleModeChange('login')}
          >
            {t('landing.auth.backToLogin')}
          </DefaultButton>
        </div>
      )}
    </section>
  );
};
