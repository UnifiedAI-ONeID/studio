'use client';

import { useMemo } from 'react';
import { isEqual } from 'lodash';
import { useCollection as useFirestoreCollection } from '@/firebase/firestore/use-collection';
import { useDoc as useFirestoreDoc } from '@/firebase/firestore/use-doc';
import { useAuth as useFirebaseAuth } from './use-auth';
import { useFirebase as useFirebaseProvider } from '@/firebase/provider';


// Custom memoization hook for Firebase queries/refs
export const useMemoFirebase = <T>(factory: () => T, deps: React.DependencyList): T => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deepCompareEquals(deps));
};

const deepCompareEquals = (a: any, b: any) => isEqual(a, b);

export const useCollection = useFirestoreCollection;
export const useDoc = useFirestoreDoc;
export const useAuth = useFirebaseAuth;
export const useFirebase = useFirebaseProvider;
