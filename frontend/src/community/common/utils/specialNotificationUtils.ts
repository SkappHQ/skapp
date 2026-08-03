import { SPECIAL_NOTIFICATION_VIEWED_CACHE_KEY } from "~community/common/constants/specialNotificationConstants";
import { SpecialNotificationType } from "~community/common/enums/SpecialNotificationEnums";
import { SpecialNotificationViewedCacheType } from "~community/common/types/SpecialNotificationTypes";
import {
  getDataFromLocalStorage,
  removeDataFromLocalStorage,
  setDataToLocalStorage
} from "~community/common/utils/accessLocalStorage";

export const readViewedCache =
  (): SpecialNotificationViewedCacheType | null => {
    try {
      const cachedValue = getDataFromLocalStorage(
        SPECIAL_NOTIFICATION_VIEWED_CACHE_KEY
      );

      if (!cachedValue || typeof cachedValue !== "object") return null;
      if (typeof cachedValue.userId !== "number") return null;
      if (
        !cachedValue.viewedDates ||
        typeof cachedValue.viewedDates !== "object"
      )
        return null;

      return cachedValue as SpecialNotificationViewedCacheType;
    } catch {
      removeDataFromLocalStorage(SPECIAL_NOTIFICATION_VIEWED_CACHE_KEY);
      return null;
    }
  };

export const writeViewedCache = (
  cache: SpecialNotificationViewedCacheType
): void => {
  setDataToLocalStorage(SPECIAL_NOTIFICATION_VIEWED_CACHE_KEY, cache);
};

export const clearViewedCache = (): void => {
  removeDataFromLocalStorage(SPECIAL_NOTIFICATION_VIEWED_CACHE_KEY);
};

export const isViewedToday = (
  cache: SpecialNotificationViewedCacheType | null,
  specialNotificationType: SpecialNotificationType,
  today: string | null,
  currentUserId: number | undefined
): boolean => {
  if (!cache || !today || currentUserId === undefined) return false;
  if (cache.userId !== currentUserId) return false;
  return cache.viewedDates[specialNotificationType] === today;
};

export const withViewedDate = (
  cache: SpecialNotificationViewedCacheType | null,
  userId: number,
  specialNotificationType: SpecialNotificationType,
  lastViewedDate: string
): SpecialNotificationViewedCacheType => {
  const existingDates = cache?.userId === userId ? cache.viewedDates : {};

  return {
    userId,
    viewedDates: { ...existingDates, [specialNotificationType]: lastViewedDate }
  };
};
