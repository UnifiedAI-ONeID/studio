
'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference } from 'firebase/firestore';
import type { DocumentWithId } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';

export function useDoc<T extends DocumentWithId>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
        }));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
