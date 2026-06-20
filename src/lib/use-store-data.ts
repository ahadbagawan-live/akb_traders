"use client";

import { useState, useCallback, useMemo } from "react";

/**
 * Hook that returns a data array from a localStorage-backed loader,
 * keyed by a dependency. Provides a refresh function that re-reads from storage.
 */
export function useStoreData<T>(loader: () => T[], key: string): [T[], () => void] {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => loader(), [key, version]);

  return [data, refresh];
}
