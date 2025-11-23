
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
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
        const userRef = doc(db, 'users', fbUser.uid);
        
        // Check if the user document exists.
        const userDoc = await getDoc(userRef).catch(err => {
            console.error("Error fetching user document:", err);
            return null;
        });

        // If it doesn't exist, create it.
        if (userDoc && !userDoc.exists()) {
          try {
            await createUserProfile(fbUser);
          } catch(err) {
            console.error("Failed to create user profile:", err);
            setLoading(false);
            setUser(null);
            return; // Stop execution if profile creation fails
          }
        }
        
        const unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUser({ id: doc.id, ...doc.data() } as AppUser);
          } else {
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
