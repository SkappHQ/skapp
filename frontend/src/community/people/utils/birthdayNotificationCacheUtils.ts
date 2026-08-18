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

export const readViewedCache = (): BirthdayNotificationViewStateType | null => {
  try {
    const cachedValue = getDataFromLocalStorage(
      BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY
    );

    if (!cachedValue || typeof cachedValue !== "object") return null;
    if (typeof cachedValue.userId !== "number") return null;
    if (typeof cachedValue.lastViewedDate !== "string") return null;

    return cachedValue as BirthdayNotificationViewStateType;
  } catch {
    removeDataFromLocalStorage(BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY);
    return null;
  }
};

export const writeViewedCache = (
  cache: BirthdayNotificationViewStateType
): void => {
  setDataToLocalStorage(BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY, cache);
};

export const isViewedToday = (
  cache: BirthdayNotificationViewStateType | null,
  today: string | null,
  currentUserId: number | undefined
): boolean => {
  if (!cache || !today || currentUserId === undefined) return false;
  if (cache.userId !== currentUserId) return false;
  return cache.lastViewedDate === today;
};

export const readDismissedCache = (): BirthdayDismissedCacheType | null => {
  try {
    const cachedValue = getDataFromLocalStorage(
      BIRTHDAY_DISMISSED_ENTRIES_CACHE_KEY
    );

    if (!cachedValue || typeof cachedValue !== "object") return null;
    if (typeof cachedValue.userId !== "number") return null;
    if (typeof cachedValue.date !== "string") return null;
    if (!Array.isArray(cachedValue.dismissedEmployeeIds)) return null;

    return cachedValue as BirthdayDismissedCacheType;
  } catch {
    removeDataFromLocalStorage(BIRTHDAY_DISMISSED_ENTRIES_CACHE_KEY);
    return null;
  }
};

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
): number[] => {
  if (!cache || !today || currentUserId === undefined) return [];
  if (cache.userId !== currentUserId) return [];
  if (cache.date !== today) return [];
  return cache.dismissedEmployeeIds;
};
