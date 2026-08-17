import {
  getDataFromLocalStorage,
  removeDataFromLocalStorage,
  setDataToLocalStorage
} from "~community/common/utils/accessLocalStorage";
import {
  BIRTHDAY_DISMISSED_ENTRIES_CACHE_KEY,
  BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY
} from "~community/people/constants/stringConstants";
import {
  BirthdayDismissedCacheType,
  BirthdayNotificationViewStateType
} from "~community/people/types/BirthdayNotificationTypes";

const readCache = <T>(
  key: string,
  isValid: (value: unknown) => value is T
): T | null => {
  try {
    const cachedValue = getDataFromLocalStorage(key);

    if (!isValid(cachedValue)) return null;

    return cachedValue;
  } catch {
    removeDataFromLocalStorage(key);
    return null;
  }
};

const isViewedCacheShape = (
  value: unknown
): value is BirthdayNotificationViewStateType => {
  const cache = value as BirthdayNotificationViewStateType;

  return (
    !!cache &&
    typeof cache === "object" &&
    typeof cache.userId === "number" &&
    typeof cache.lastViewedDate === "string"
  );
};

const isDismissedCacheShape = (
  value: unknown
): value is BirthdayDismissedCacheType => {
  const cache = value as BirthdayDismissedCacheType;

  return (
    !!cache &&
    typeof cache === "object" &&
    typeof cache.userId === "number" &&
    typeof cache.date === "string" &&
    Array.isArray(cache.dismissedEmployeeIds)
  );
};

const matchesUserAndDate = (
  cacheUserId: number,
  cacheDate: string,
  today: string | null,
  currentUserId: number | undefined
): boolean => {
  if (!today || currentUserId === undefined) return false;
  return cacheUserId === currentUserId && cacheDate === today;
};

export const readViewedCache = (): BirthdayNotificationViewStateType | null =>
  readCache(BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY, isViewedCacheShape);

export const writeViewedCache = (
  cache: BirthdayNotificationViewStateType
): void => {
  setDataToLocalStorage(BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY, cache);
};

export const isViewedToday = (
  cache: BirthdayNotificationViewStateType | null,
  today: string | null,
  currentUserId: number | undefined
): boolean =>
  !!cache &&
  matchesUserAndDate(cache.userId, cache.lastViewedDate, today, currentUserId);

export const readDismissedCache = (): BirthdayDismissedCacheType | null =>
  readCache(BIRTHDAY_DISMISSED_ENTRIES_CACHE_KEY, isDismissedCacheShape);

export const writeDismissedCache = (
  cache: BirthdayDismissedCacheType
): void => {
  setDataToLocalStorage(BIRTHDAY_DISMISSED_ENTRIES_CACHE_KEY, cache);
};

export const clearDismissedCache = (): void => {
  removeDataFromLocalStorage(BIRTHDAY_DISMISSED_ENTRIES_CACHE_KEY);
};

export const getDismissedEmployeeIds = (
  cache: BirthdayDismissedCacheType | null,
  today: string | null,
  currentUserId: number | undefined
): number[] =>
  cache && matchesUserAndDate(cache.userId, cache.date, today, currentUserId)
    ? cache.dismissedEmployeeIds
    : [];
