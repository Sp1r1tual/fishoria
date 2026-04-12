import { LandingLayout } from '@/layouts/LandingLayout';
import { ResetPasswordForm } from '@/components/landing/ResetPasswordForm';
import { AuthFormCenter } from '@/components/landing/AuthFormCenter';

export const ResetPasswordPage = () => {
  return (
    <LandingLayout bubbleCount={20}>
      <AuthFormCenter>
        <ResetPasswordForm />
      </AuthFormCenter>
    </LandingLayout>
  );
};
