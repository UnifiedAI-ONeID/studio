import AuthForm from '@/components/auth/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignUpPage() {
  return <AuthForm mode="signup" />;
}
