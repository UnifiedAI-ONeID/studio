
'use client';

import { getApps, initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for production.
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// --- EMULATOR CONNECTIONS ---
// The following block is for connecting to LOCAL emulators for development.
// It is commented out by default to ensure the app connects to production Firebase services.
// To use the emulators, you must:
// 1. Set up the Firebase Emulators on your local machine (see Firebase documentation).
// 2. Uncomment the block below.
// 3. Run 'firebase emulators:start' in your terminal before starting the app.

if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development') {
  try {
    console.log("Connecting to Firebase Emulators...");
    // Make sure you have the emulators running.
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log("Successfully connected to Firebase Emulators.");
  } catch (e) {
    console.error("Error connecting to emulators. Make sure they are running.", e);
  }
}


export { 
  app, 
  auth, 
  db, 
  storage, 
};
