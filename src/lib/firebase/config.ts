// This file contains the Firebase configuration.
// IMPORTANT: Replace the placeholder values with your actual Firebase project configuration.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAxqdIqO55-FOnvBvIBtrOj_w8duskhvJI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-791034259-1f91e.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-791034259-1f91e",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-791034259-1f91e.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "349629203808",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:349629203808:web:3386aed3ea9a7e3d0e4a05",
};
