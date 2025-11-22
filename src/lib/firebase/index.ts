'use client';

import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { getUserProfile as getProfile } from './firestore';
import type { AppUser } from '@/lib/types';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

const getUserProfile = async (uid: string): Promise<AppUser | null> => {
    return getProfile(uid);
}


export { app, auth, firestore, storage, getUserProfile };
