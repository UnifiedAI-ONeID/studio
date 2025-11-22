'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export function requireAuthOrPrompt(action: () => void) {
  const { user, setPrompted } = useAuth.getState(); // Direct state access
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    setPrompted(true);
    const continueUrl = pathname;
    router.push(`/login?continueUrl=${encodeURIComponent(continueUrl)}`);
  } else {
    action();
  }
}
