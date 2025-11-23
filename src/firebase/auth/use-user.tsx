
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db as firestore } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { createUserProfile } from '@/lib/firebase/firestore';

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // When auth state changes to logged in, ensure profile exists before setting up listener.
        await createUserProfile(fbUser);
        
        const userRef = doc(firestore, 'users', fbUser.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUser({ id: doc.id, ...doc.data() } as AppUser);
          } else {
            // Profile doesn't exist yet, it might be in the process of being created.
            // createUserProfile should handle this, but we set user to null temporarily.
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setLoading(false);
        });

        // Return cleanup function for the snapshot listener
        return () => unsubscribeSnapshot();
      } else {
        // No firebase user, so no app user.
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, firebaseUser, loading };
};
