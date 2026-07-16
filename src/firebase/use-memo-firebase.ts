
'use client';

import { useMemo, DependencyList } from 'react';

/**
 * A specialized useMemo hook for stabilizing Firebase references and queries.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
