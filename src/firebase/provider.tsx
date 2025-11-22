'use client';
import {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useContext
} from 'react';
import { User as FirebaseUser, Auth } from 'firebase/auth';
import {
  doc,
  onSnapshot,
  DocumentReference,
} from 'firebase/firestore';
import {
  initializeFirebase,
  auth as fAuth,
  firestore as fs,
} from '@/lib/firebase';
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

export const AuthContext = createContext<AuthState>({
  user: null,
  firebaseUser: null,
  loading: true,
  prompted: false,
  setPrompted: () => {},
});


export const FirebaseContext = createContext<{
  auth: Auth;
  firestore: Firestore;
} | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const { auth, firestore } = useMemo(() => initializeFirebase(), []);

  const value = useMemo(
    () => ({
      auth,
      firestore,
    }),
    [auth, firestore]
  );
  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export const useFirebase = (): {auth: Auth, firestore: Firestore} => {
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
