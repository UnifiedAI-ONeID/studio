import AuthForm from '@/components/auth/auth-form';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const continueUrl = Array.isArray(searchParams.continueUrl)
    ? searchParams.continueUrl[0]
    : searchParams.continueUrl;

  return <AuthForm mode="login" continueUrl={continueUrl} />;
}
