'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';

export function requireAuthOrPrompt(action: () => void) {
    const authState = useAuth();
    const { user, setPrompted } = authState;

    if (!user) {
        if (setPrompted) setPrompted(true);
        // This part needs to be called within a component to use router/pathname
        // This file as-is isn't a hook or component, so it can't use them.
        // It's better to handle this logic within the component that calls this function.
        console.warn("User not authenticated. Redirection logic should be handled in the calling component.");

    } else {
        action();
    }
}
