'use client';

import React, { useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

// This component's sole purpose is to listen to auth state changes
// and update the Zustand store. It doesn't render anything itself.
const AuthStateInitializer = () => {
    const { setUser, setFirebaseUser, setLoading } = useAuth();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                const userProfile = await getUserProfile(fbUser.uid);
                setUser(userProfile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setFirebaseUser, setLoading]);
    
    return null; // This component does not render anything.
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AuthStateInitializer />
      {children}
    </>
  );
};
