'use client';

import { useCollection as useFirestoreCollection } from '@/firebase/firestore/use-collection';
import { useDoc as useFirestoreDoc } from '@/firebase/firestore/use-doc';
import { useAuth as useFirebaseAuth } from './use-auth';
import { useFirebase as useFirebaseProvider } from '@/firebase/provider';
import { useMemo } from 'react';

// Custom memoization hook for Firebase queries/refs to prevent re-renders
const useMemoFirebase = <T>(factory: () => T, deps: React.DependencyList): T => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
};

export const useCollection = useFirestoreCollection;
export const useDoc = useFirestoreDoc;
export const useAuth = useFirebaseAuth;
export const useFirebase = useFirebaseProvider;
export { useMemoFirebase };
