import { BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY } from "~community/people/constants/birthdayNotificationConstants";
import { BirthdayNotificationViewStateType } from "~community/people/types/BirthdayNotificationTypes";
import {
  isViewedToday,
  readViewedCache
} from "~community/people/utils/birthdayNotificationCacheUtils";

const buildCache = (
  lastViewedDate: string,
  userId = 3
): BirthdayNotificationViewStateType => ({ userId, lastViewedDate });

describe("isViewedToday", () => {
  const cache = buildCache("2026-08-01");

  it("is viewed when the user and date both match", () => {
    expect(isViewedToday(cache, "2026-08-01", 3)).toBe(true);
  });

  it("is not viewed once the date has moved on", () => {
    expect(isViewedToday(cache, "2026-08-02", 3)).toBe(false);
  });

  it("is not viewed for a different user on the same browser", () => {
    expect(isViewedToday(cache, "2026-08-01", 4)).toBe(false);
  });

  it("is not viewed when there is no cache", () => {
    expect(isViewedToday(null, "2026-08-01", 3)).toBe(false);
  });

  it("is not viewed when today is unknown", () => {
    expect(isViewedToday(cache, null, 3)).toBe(false);
  });

  it("is not viewed when the viewer id is unavailable", () => {
    expect(isViewedToday(cache, "2026-08-01", undefined)).toBe(false);
  });
});

describe("readViewedCache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const writeRaw = (rawValue: string): void => {
    localStorage.setItem(BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY, rawValue);
  };

  it("returns the cache when the stored shape is valid", () => {
    writeRaw(JSON.stringify(buildCache("2026-08-01")));

    expect(readViewedCache()).toEqual({
      userId: 3,
      lastViewedDate: "2026-08-01"
    });
  });

  it("returns null when nothing is stored", () => {
    expect(readViewedCache()).toBeNull();
  });

  it("rejects a cache without a numeric user id", () => {
    writeRaw(JSON.stringify({ userId: "3", lastViewedDate: "2026-08-01" }));

    expect(readViewedCache()).toBeNull();
  });

  it("rejects a cache without a string last viewed date", () => {
    writeRaw(JSON.stringify({ userId: 3, viewedDates: { BIRTHDAY: "x" } }));

    expect(readViewedCache()).toBeNull();
  });

  it("discards the stored value when it cannot be parsed", () => {
    writeRaw("not-json");

    expect(readViewedCache()).toBeNull();
    expect(
      localStorage.getItem(BIRTHDAY_NOTIFICATION_VIEW_STATE_CACHE_KEY)
    ).toBeNull();
  });
});
