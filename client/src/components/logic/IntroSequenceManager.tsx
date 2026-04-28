import { useState } from 'react';

import { CookieConsent } from '../CookieConsent/CookieConsent';
import { WelcomeModal } from '../UI/WelcomeModal/WelcomeModal';
import { FullscreenTip } from '../UI/FullscreenTip/FullscreenTip';

type SequenceStep = 'cookies' | 'welcome' | 'fullscreen' | 'none';

const COOKIE_KEY = 'web-fishing-cookie-consent';
const WELCOME_KEY = 'fishoria_welcome_shown';
const FULLSCREEN_KEY = 'fishoria_fullscreen_tip_shown';

export const IntroSequenceManager = () => {
  const [step, setStep] = useState<SequenceStep>(() => {
    if (typeof window === 'undefined') return 'none';

    const hasCookies = localStorage.getItem(COOKIE_KEY);
    const hasWelcome = localStorage.getItem(WELCOME_KEY);
    const hasFullscreen = localStorage.getItem(FULLSCREEN_KEY);

    if (!hasCookies) return 'cookies';
    if (!hasWelcome) return 'welcome';
    if (!hasFullscreen && !document.fullscreenElement) return 'fullscreen';

    return 'none';
  });

  const handleNext = () => {
    setStep((current) => {
      if (current === 'cookies') {
        if (!localStorage.getItem(WELCOME_KEY)) return 'welcome';
        if (!localStorage.getItem(FULLSCREEN_KEY)) return 'fullscreen';
        return 'none';
      }
      if (current === 'welcome') {
        if (!localStorage.getItem(FULLSCREEN_KEY)) return 'fullscreen';
        return 'none';
      }
      if (current === 'fullscreen') {
        localStorage.setItem(FULLSCREEN_KEY, 'true');
        return 'none';
      }
      return 'none';
    });
  };

  if (step === 'none') return null;

  return (
    <>
      {step === 'cookies' && <CookieConsent onAccept={handleNext} />}
      {step === 'welcome' && <WelcomeModal onClose={handleNext} />}
      {step === 'fullscreen' && <FullscreenTip onClose={handleNext} />}
    </>
  );
};
