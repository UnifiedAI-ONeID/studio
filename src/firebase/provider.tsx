'use client';
import {
  createContext,
  useState,
  useMemo,
  ReactNode,
  useContext
} from 'react';
import { User as FirebaseUser, Auth } from 'firebase/auth';
import { auth as fAuth, db as fs } from '@/lib/firebase';
import { useUser } from './auth/use-user';

import type { AppUser } from '@/lib/types';
import { Firestore } from 'firebase/firestore';

export interface AuthState {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  prompted: boolean;
  setPrompted: (prompted: boolean) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  firebaseUser: null,
  loading: true,
  prompted: false,
  setPrompted: () => {},
});


export interface FirebaseContextValue {
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

function FirebaseProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      auth: fAuth,
      firestore: fs,
    }),
    []
  );
  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { user, firebaseUser, loading } = useUser();
  const [prompted, setPrompted] = useState(false);
  
  const authContextValue = useMemo(
    () => ({ user, firebaseUser, loading, prompted, setPrompted }),
    [user, firebaseUser, loading, prompted]
  );

  return (
    <FirebaseProvider>
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    </FirebaseProvider>
  );
}
