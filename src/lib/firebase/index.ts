'use client';

import { getApps, initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage;

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  
  return { app, auth, firestore, storage };
};

initializeFirebase();

export { 
  app, 
  auth, 
  firestore, 
  storage, 
  initializeFirebase,
};
