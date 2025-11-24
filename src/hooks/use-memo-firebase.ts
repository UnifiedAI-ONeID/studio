
'use client';

import { useMemo, DependencyList } from 'react';

// Custom memoization hook for Firebase queries/refs to prevent re-renders
export const useMemoFirebase = <T>(factory: () => T, deps: DependencyList): T => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
};

    