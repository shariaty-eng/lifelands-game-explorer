"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UrlStateValue = string | string[] | undefined;

export interface UseUrlStateOptions {
  pushHistory?: boolean;
}

function readFromSearchParams(
  searchParams: URLSearchParams,
  key: string,
): string | string[] | undefined {
  const all = searchParams.getAll(key);
  if (all.length === 0) return undefined;
  if (all.length === 1) return all[0];
  return all;
}

function writeToSearchParams(
  searchParams: URLSearchParams,
  key: string,
  value: UrlStateValue,
): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());
  next.delete(key);
  if (value === undefined) return next;
  if (Array.isArray(value)) {
    for (const v of value) {
      if (v !== "") next.append(key, v);
    }
    return next;
  }
  if (value !== "") next.set(key, value);
  return next;
}

export function useUrlState(
  key: string,
  defaultValue: UrlStateValue,
  options: UseUrlStateOptions = {},
): [string | string[] | undefined, (v: UrlStateValue) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    const fromUrl = readFromSearchParams(
      new URLSearchParams(searchParams.toString()),
      key,
    );
    return fromUrl ?? defaultValue;
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (v: UrlStateValue) => {
      const next = writeToSearchParams(
        new URLSearchParams(window.location.search),
        key,
        v,
      );
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (options.pushHistory) {
        router.push(url, { scroll: false });
      } else {
        router.replace(url, { scroll: false });
      }
    },
    [key, pathname, router, options.pushHistory],
  );

  return [value, setValue];
}

export function useUrlStateBatch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (
      updates: Record<string, UrlStateValue>,
      options: UseUrlStateOptions = {},
    ) => {
      let next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        next = writeToSearchParams(next, key, value);
      }
      const queryString = next.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      if (options.pushHistory) {
        router.push(url, { scroll: false });
      } else {
        router.replace(url, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );
}
