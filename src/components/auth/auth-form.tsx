
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle, signUpWithEmail, signInWithEmail } from '@/lib/firebase/auth';
import AvidityLogo from '../logo';
import { useAuth } from '@/hooks/use-auth';

type AuthFormProps = {
  mode: 'login' | 'signup';
  continueUrl?: string;
};

export default function AuthForm({ mode, continueUrl }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { setPrompted } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSuccess = () => {
    if (setPrompted) setPrompted(false);
    // The main app layout will handle the redirect, ensuring consistency.
    router.push(continueUrl || '/home');
  }

  const validate = () => {
      if (!email.includes('@')) {
          setError('Please enter a valid email.');
          return false;
      }
      if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return false;
      }
      setError('');
      return true;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        toast({
          title: 'Account Created!',
          description: "Welcome! You're now part of the community.",
        });
      } else {
        await signInWithEmail(email, password);
      }
      // The AppLayout's useEffect will handle the redirect on auth state change.
      // This centralizes the logic.
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // The AppLayout's useEffect will handle the redirect on auth state change.
    } catch (error: any)
       {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message || 'Could not sign in with Google.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center gap-2">
            <AvidityLogo className="h-10 w-10 text-primary" />
            <span className="font-headline text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              Avidity
            </span>
        </Link>
        <Card className="w-full">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </CardTitle>
                <CardDescription>
                {mode === 'login'
                    ? 'Sign in to continue to Avidity.'
                    : 'Join the community to get started.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                        id='email'
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading || isGoogleLoading}
                    />
                    </div>
                    <div className='space-y-2'>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                        id='password'
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading || isGoogleLoading}
                    />
                    </div>
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                    <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isGoogleLoading}
                    >
                    {isLoading && (
                        <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                        </svg>
                    )}
                    {mode === 'login' ? 'Log In' : 'Sign Up'}
                    </Button>
                </form>
                <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
                </div>
                <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                >
                {isGoogleLoading ? (
                    <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                    </svg>
                ) : (
                    <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-7.053 2.4-5.333 0-9.667-4.333-9.667-9.667s4.334-9.667 9.667-9.667c3.067 0 5.067 1.24 6.267 2.333l2.8-2.8C18.4 1.133 15.6.0 12.48.0 5.587.0.0 5.587.0 12.48s5.587 12.48 12.48 12.48c6.88 0 12.027-4.933 12.027-12.027 0-.733-.067-1.467-.2-2.133H12.48z"/></svg>
                )}
                Google
                </Button>
                <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                    <>
                    Don&apos;t have an account?{' '}
                    <Link
                        href={`/signup${continueUrl ? `?continueUrl=${encodeURIComponent(continueUrl || '')}` : ''}`}
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Sign Up
                    </Link>
                    </>
                ) : (
                    <>
                    Already have an account?{' '}
                    <Link
                        href={`/login${continueUrl ? `?continueUrl=${encodeURIComponent(continueUrl || '')}` : ''}`}
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Log In
                    </Link>
                    </>
                )}
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
