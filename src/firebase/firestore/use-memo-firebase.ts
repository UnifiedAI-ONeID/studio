'use client';
import { useMemo } from 'react';
import { isEqual } from 'lodash';

// Custom memoization hook for Firebase queries/refs
export const useMemoFirebase = <T>(factory: () => T, deps: React.DependencyList): T => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deepCompareEquals(deps));
};

const deepCompareEquals = (a: any, b: any) => isEqual(a, b);

    