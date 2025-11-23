
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
import { auth } from '@/src/lib/firebase';
import { createUserProfile } from './firestore';

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await createUserProfile(userCredential.user);
  return userCredential.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async (): Promise<User> => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  // This will create a profile if one doesn't exist.
  await createUserProfile(userCredential.user);
  return userCredential.user;
};

export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

export { onAuthStateChanged };
export type { User as FirebaseUser };
