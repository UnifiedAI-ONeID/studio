// lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAxqdIqO55-FOnvBvIBtrOj_w8duskhvJI",
  authDomain: "studio-791034259-1f91e.firebaseapp.com",
  projectId: "studio-791034259-1f91e",
  storageBucket: "studio-791034259-1f91e.firebasestorage.app",
  messagingSenderId: "349629203808",
  appId: "1:349629203808:web:3386aed3ea9a7e3d0e4a05"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
