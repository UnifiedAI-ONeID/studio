
'use client';

import { useCollection as useFirestoreCollection } from './use-collection';
import { useDoc as useFirestoreDoc } from './use-doc';

// This file is a workaround to avoid circular dependencies between the hooks and the components that use them.
// By re-exporting them from a separate file, we can break the cycle.

export const useCollection = useFirestoreCollection;
export const useDoc = useFirestoreDoc;
