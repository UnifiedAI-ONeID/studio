
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
        // Attempt to create a profile. If it already exists, this does nothing.
        // This handles the race condition where the snapshot listener might run
        // before the profile is created on first login.
        try {
          await createUserProfile(fbUser);
        } catch (err) {
            console.error("Error ensuring user profile exists:", err);
            // Decide if we should bail out here. For now, we'll let the snapshot listener try.
        }

        const userRef = doc(db, 'users', fbUser.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUser({ id: doc.id, ...doc.data() } as AppUser);
          } else {
            // This case might happen briefly on first login, or if profile deletion fails.
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setUser(null);
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
