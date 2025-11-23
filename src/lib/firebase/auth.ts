
'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from './firestore';

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  // The useUser hook will handle profile creation.
  return userCredential.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async (): Promise<User> => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  // The useUser hook is now the single source of truth for creating the user profile.
  // This prevents a race condition where the profile is created in two places.
  return userCredential.user;
};

export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

export { onAuthStateChanged };
export type { User as FirebaseUser };
