'use client';

import { useMemo, useRef, DependencyList } from 'react';
import { isEqual } from 'lodash';
import { useCollection as useFirestoreCollection } from '@/firebase/firestore/use-collection';
import { useDoc as useFirestoreDoc } from '@/firebase/firestore/use-doc';
import { useAuth as useFirebaseAuth } from './use-auth';
import { useFirebase as useFirebaseProvider } from '@/firebase/provider';

// Custom memoization hook for Firebase queries/refs to prevent re-renders
const useMemoFirebase = <T>(factory: () => T, deps: DependencyList): T => {
    const prevDeps = useRef<DependencyList | null>(null);

    if (prevDeps.current === null || !isEqual(deps, prevDeps.current)) {
        prevDeps.current = deps;
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, prevDeps.current);
};

export const useCollection = useFirestoreCollection;
export const useDoc = useFirestoreDoc;
export const useAuth = useFirebaseAuth;
export const useFirebase = useFirebaseProvider;
export { useMemoFirebase };
