'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './index';
import { createUserProfile } from './firestore';

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await createUserProfile(userCredential.user);
  return userCredential;
};

export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  // This will create a profile if one doesn't exist.
  await createUserProfile(userCredential.user);
  return userCredential;
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};
