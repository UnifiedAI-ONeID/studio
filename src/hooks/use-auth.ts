'use client';

import { create } from 'zustand';
import type { AppUser } from '@/lib/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  prompted: boolean;
  setPrompted: (prompted: boolean) => void;
  setUser: (user: AppUser | null) => void;
  setFirebaseUser: (firebaseUser: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  loading: true,
  prompted: false,
  setPrompted: (prompted) => set({ prompted }),
  setUser: (user) => set({ user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setLoading: (loading) => set({ loading }),
}));
