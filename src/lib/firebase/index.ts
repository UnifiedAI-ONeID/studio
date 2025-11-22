'use client';

import { getApps, initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

import { FirebaseProvider, FirebaseClientProvider, useFirebase } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { useAuth as useFirebaseAuthHook } from '@/hooks/use-auth';


// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage;

const initializeFirebase = () => {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
  }
  // For server-side rendering
  return { app, auth, firestore, storage };
};

initializeFirebase();

const useAuth = useFirebaseAuthHook;
const useFirebaseApp = useFirebase;
const useFirestore = () => useFirebase().firestore;


export { 
  app, 
  auth, 
  firestore, 
  storage, 
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useMemoFirebase,
};
