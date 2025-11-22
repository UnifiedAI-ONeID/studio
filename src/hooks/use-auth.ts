'use client';

import { AuthContext } from '@/firebase/provider';
import { useContext } from 'react';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a FirebaseProvider');
    }
    return context;
}
