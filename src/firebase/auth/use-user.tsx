'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { createUserProfile } from '@/lib/firebase/firestore';

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    const userRef = doc(firestore, 'users', firebaseUser.uid);
    const unsubscribeSnapshot = onSnapshot(userRef, async (doc) => {
      if (doc.exists()) {
        setUser({ id: doc.id, ...doc.data() } as AppUser);
      } else {
        // This might happen for a brand new user, create their profile
        try {
            await createUserProfile(firebaseUser);
            // The snapshot listener will pick up the new profile
        } catch(e) {
            console.error("Failed to create user profile on-the-fly", e);
            setUser(null); // Or handle this case appropriately
        }
      }
      setLoading(false);
    }, (error) => {
        console.error("Error listening to user profile:", error);
        setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [firebaseUser]);

  return { user, firebaseUser, loading };
};
