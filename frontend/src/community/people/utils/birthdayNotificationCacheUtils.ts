import {
  getDataFromLocalStorage,
  removeDataFromLocalStorage,
  setDataToLocalStorage
} from "~community/common/utils/accessLocalStorage";
import { BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY } from "~community/people/constants/stringConstants";
import { BirthdayNotificationViewStateType } from "~community/people/types/BirthdayNotificationTypes";

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

export const clearViewedCache = (): void => {
  removeDataFromLocalStorage(BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY);
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
