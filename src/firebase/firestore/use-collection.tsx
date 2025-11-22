'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData } from 'firebase/firestore';
import type { DocumentWithId } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';

export function useCollection<T extends DocumentWithId>(query: Query | null) {
  const [data, setData] = useState<T[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: (query as any)._query.path.segments.join('/'),
            operation: 'list',
        }));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
