
'use client';

import { useEffect, useState } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { firebaseUser, user } = useAuth();
  
  useEffect(() => {
    const handler = (e: FirestorePermissionError) => {
        if (process.env.NODE_ENV === 'development') {
            setError(e);
        }
    };
    errorEmitter.on('permission-error', handler);

    return () => {
      errorEmitter.removeListener('permission-error', handler);
    };
  }, []);

  if (!error) return null;

  const context = {
    ...error.context,
    auth: {
      uid: firebaseUser?.uid,
      token: firebaseUser?.toJSON(),
      appUser: user,
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          backgroundColor: '#282c34',
          color: '#abb2bf',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          border: '1px solid #c678dd',
        }}
      >
        <button
          onClick={() => setError(null)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: '#abb2bf',
            cursor: 'pointer',
          }}
        >
          <X size={24} />
        </button>
        <h2 style={{ color: '#e06c75', fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #c678dd', paddingBottom: '0.5rem' }}>
          Firestore Security Rule Violation
        </h2>
        <p style={{ color: '#d19a66', marginBottom: '1rem' }}>
          Your client-side request was denied. Check your Firestore Security Rules.
        </p>
        <pre
          style={{
            backgroundColor: '#21252b',
            padding: '1rem',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontSize: '0.875rem'
          }}
        >
          {JSON.stringify(context, null, 2)}
        </pre>
      </div>
    </div>
  );
}
