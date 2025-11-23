
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db as firestore } from '@/lib/firebase';
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
    let unsubscribeSnapshot: () => void;

    const setupListener = () => {
        unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                setUser({ id: doc.id, ...doc.data() } as AppUser);
            } else {
                // This will be handled by the profile creation logic below
                setUser(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user profile:", error);
            setLoading(false);
        });
    };
    
    const checkAndCreateProfile = async () => {
        try {
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                await createUserProfile(firebaseUser);
            }
            // After potentially creating the profile, set up the listener.
            // The listener will then fetch the data.
            setupListener();
        } catch (e) {
            console.error("Failed to check or create user profile", e);
            setLoading(false);
        }
    };
    
    checkAndCreateProfile();

    return () => {
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
        }
    };
  }, [firebaseUser]);

  return { user, firebaseUser, loading };
};
