'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, DocumentReference } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { getUserProfile } from '@/lib/firebase/firestore';


export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userProfile = await getUserProfile(fbUser.uid);
        if (userProfile) {
          setUser(userProfile);
        } else {
           const { uid, email, displayName, photoURL } = fbUser;
            const profileData = {
              uid,
              id: uid,
              email,
              displayName: displayName || email?.split('@')[0],
              photoURL,
              role: 'user',
              interests: [],
              skills: [],
              locationPreferences: [],
            } as AppUser;
          setUser(profileData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, firebaseUser, loading };
};
