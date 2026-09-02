"use client";

import { useEffect, useRef, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 450): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useAbortableFetch() {
  const controllerRef = useRef<AbortController | null>(null);

  const fetchWithAbort = async <T>(url: string, body: unknown): Promise<T | null> => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controllerRef.current.signal,
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  useEffect(() => () => controllerRef.current?.abort(), []);
  return fetchWithAbort;
}
