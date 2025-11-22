import AuthForm from '@/components/auth/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
   const continueUrl = Array.isArray(searchParams.continueUrl)
    ? searchParams.continueUrl[0]
    : searchParams.continueUrl;

  return <AuthForm mode="signup" continueUrl={continueUrl} />;
}
