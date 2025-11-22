'use client';

import { createContext, useContext } from 'react';
import type { AppUser } from '@/lib/types';
import type { User as FirebaseUser } from 'firebase/auth';

export interface AuthState {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  prompted: boolean;
  setPrompted?: (prompted: boolean) => void;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  firebaseUser: null,
  loading: true,
  prompted: false,
});

export const useAuth = () => {
    return useContext(AuthContext);
}
