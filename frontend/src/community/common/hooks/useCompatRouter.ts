"use client";

import {
  useRouter as useAppRouter,
  useParams,
  usePathname,
  useSearchParams
} from "next/navigation";
import { useMemo } from "react";

import { navigationEvents } from "~community/common/utils/navigationEvents";

export interface UrlObject {
  pathname?: string;
  query?: Record<string, unknown>;
  hash?: string;
}

export type CompatUrl = string | UrlObject;

/**
 * Serialises the Pages Router's object-form URL (`{ pathname, query }`) into the
 * plain string the App Router's `push`/`replace` require.
 */
export const buildUrl = (url: CompatUrl): string => {
  if (typeof url === "string") return url;

  const { pathname = "", query, hash } = url;

  const search = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => search.append(key, String(entry)));
    } else {
      search.append(key, String(value));
    }
  });

  const queryString = search.toString();

  return `${pathname}${queryString ? `?${queryString}` : ""}${hash ?? ""}`;
};

/**
 * Drop-in replacement for the Pages Router's `useRouter`, implemented on top of
 * `next/navigation`. Exists so the ~250 call sites migrated from the Pages
 * Router keep working without each being rewritten by hand.
 *
 * Behaves identically for: push, replace, back, forward, prefetch, query,
 * asPath, isReady.
 *
 * Differs from the Pages Router in three ways:
 *  - `pathname` returns the resolved URL, not the route pattern. A dynamic
 *    route reports `/people/individual/42`, where the Pages Router reported
 *    `/people/individual/[id]`.
 *  - `events` only sees programmatic navigation (see `navigationEvents`).
 *  - `reload` does a full document reload.
 */
const useCompatRouter = () => {
  const router = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  return useMemo(() => {
    /**
     * Emits `routeChangeStart` and reports whether a handler cancelled the
     * navigation by throwing, as the Pages Router allowed.
     */
    const isCancelled = (target: string): boolean => {
      try {
        navigationEvents.emit("routeChangeStart", target);
        return false;
      } catch {
        return true;
      }
    };

    const query: Record<string, string | string[]> = {};

    searchParams?.forEach((value, key) => {
      const existing = query[key];
      if (existing === undefined) {
        query[key] = value;
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        query[key] = [existing, value];
      }
    });

    // Dynamic segments win over search params, matching Pages Router merging.
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined) query[key] = value as string | string[];
    });

    const search = searchParams?.toString();

    return {
      push: async (url: CompatUrl): Promise<boolean> => {
        const target = buildUrl(url);
        if (isCancelled(target)) return false;
        router.push(target);
        return true;
      },
      replace: async (url: CompatUrl): Promise<boolean> => {
        const target = buildUrl(url);
        if (isCancelled(target)) return false;
        router.replace(target);
        return true;
      },
      back: () => router.back(),
      forward: () => router.forward(),
      refresh: () => router.refresh(),
      reload: () => window.location.reload(),
      prefetch: (url: CompatUrl) => router.prefetch(buildUrl(url)),
      query,
      pathname,
      asPath: `${pathname}${search ? `?${search}` : ""}`,
      // The App Router has no hydration gap for route params.
      isReady: true,
      events: navigationEvents
    };
  }, [router, pathname, searchParams, params]);
};

/** Shape returned by {@link useCompatRouter}; replaces the Pages Router's `NextRouter`. */
export type CompatRouter = ReturnType<typeof useCompatRouter>;

export default useCompatRouter;
