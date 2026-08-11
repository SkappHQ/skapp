import { useCallback, useEffect, useRef, useState } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { BirthdayNotificationViewStateType } from "~community/people/types/BirthdayNotificationTypes";
import {
  isViewedToday as isViewedTodayForDate,
  readViewedCache,
  writeViewedCache
} from "~community/people/utils/birthdayNotificationCacheUtils";

interface BirthdayViewedCacheType {
  isCacheLoaded: boolean;
  isViewedToday: boolean;
  cacheLastViewedDate: (lastViewedDate: string) => void;
}

const useBirthdayViewedCache = (today: string): BirthdayViewedCacheType => {
  const { userId } = useSessionData();

  const [isCacheLoaded, setIsCacheLoaded] = useState(false);
  const [viewedCache, setViewedCache] =
    useState<BirthdayNotificationViewStateType | null>(null);

  const viewedCacheRef = useRef<BirthdayNotificationViewStateType | null>(null);

  useEffect(() => {
    const loadedCache = readViewedCache();
    viewedCacheRef.current = loadedCache;
    setViewedCache(loadedCache);
    setIsCacheLoaded(true);
  }, []);

  const cacheLastViewedDate = useCallback(
    (lastViewedDate: string) => {
      if (userId === undefined) return;

      const nextCache = { userId, lastViewedDate };

      viewedCacheRef.current = nextCache;
      writeViewedCache(nextCache);
      setViewedCache(nextCache);
    },
    [userId]
  );

  return {
    isCacheLoaded,
    isViewedToday: isViewedTodayForDate(viewedCache, today, userId),
    cacheLastViewedDate
  };
};

export default useBirthdayViewedCache;
