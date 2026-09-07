"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { navigationEvents } from "~community/common/utils/navigationEvents";

/**
 * Emits `routeChangeComplete` whenever the resolved URL changes, so consumers
 * of the Pages-Router-shaped `router.events` (e.g. `useRouteLoading`) still
 * get told when a navigation finished.
 *
 * Mounted once, inside the root provider stack.
 */
const NavigationEventsBridge = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();
  const url = `${pathname}${search ? `?${search}` : ""}`;
  const previousUrl = useRef(url);

  useEffect(() => {
    if (previousUrl.current === url) return;
    previousUrl.current = url;
    navigationEvents.emit("routeChangeComplete", url);
  }, [url]);

  return null;
};

export default NavigationEventsBridge;
