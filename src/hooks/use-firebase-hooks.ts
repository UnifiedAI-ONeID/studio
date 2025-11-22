'use client';

import { useMemo } from 'react';
import { isEqual } from 'lodash';
import { useCollection as useFirestoreCollection } from '@/firebase/firestore/use-collection';
import { useDoc as useFirestoreDoc } from '@/firebase/firestore/use-doc';
import { useAuth as useFirebaseAuth } from './use-auth';
import { useFirebase as useFirebaseProvider } from '@/firebase/provider';
import { useMemoFirebase as useMemoFirebaseHook } from '@/firebase/firestore/use-memo-firebase';

export const useCollection = useFirestoreCollection;
export const useDoc = useFirestoreDoc;
export const useAuth = useFirebaseAuth;
export const useFirebase = useFirebaseProvider;
export const useMemoFirebase = useMemoFirebaseHook;
