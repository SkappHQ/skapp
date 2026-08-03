import { SpecialNotificationType } from "~community/common/enums/SpecialNotificationEnums";
import { SpecialNotificationViewedCacheType } from "~community/common/types/SpecialNotificationTypes";
import {
  isViewedToday,
  withViewedDate
} from "~community/common/utils/specialNotificationUtils";

const BIRTHDAY = SpecialNotificationType.BIRTHDAY;

// Stands in for the next notification type until it joins the enum, so per-type
// isolation is covered before a second type has to rely on it.
const OTHER_TYPE = "WORK_ANNIVERSARY" as unknown as SpecialNotificationType;

const buildCache = (
  viewedDates: Partial<Record<SpecialNotificationType, string>>,
  userId = 3
): SpecialNotificationViewedCacheType => ({ userId, viewedDates });

describe("isViewedToday", () => {
  const cache = buildCache({ [BIRTHDAY]: "2026-08-01" });

  it("is viewed when the user, type and date all match", () => {
    expect(isViewedToday(cache, BIRTHDAY, "2026-08-01", 3)).toBe(true);
  });

  it("is not viewed once the date has moved on", () => {
    expect(isViewedToday(cache, BIRTHDAY, "2026-08-02", 3)).toBe(false);
  });

  it("is not viewed for a different user on the same browser", () => {
    expect(isViewedToday(cache, BIRTHDAY, "2026-08-01", 4)).toBe(false);
  });

  it("is not viewed when there is no cache", () => {
    expect(isViewedToday(null, BIRTHDAY, "2026-08-01", 3)).toBe(false);
  });

  it("is not viewed when today is unknown", () => {
    expect(isViewedToday(cache, BIRTHDAY, null, 3)).toBe(false);
  });

  it("is not viewed when the viewer id is unavailable", () => {
    expect(isViewedToday(cache, BIRTHDAY, "2026-08-01", undefined)).toBe(false);
  });

  it("does not treat one type as viewed because another type was", () => {
    expect(isViewedToday(cache, OTHER_TYPE, "2026-08-01", 3)).toBe(false);
  });
});

describe("withViewedDate", () => {
  it("records the date against the given type", () => {
    expect(withViewedDate(null, 3, BIRTHDAY, "2026-08-01")).toEqual({
      userId: 3,
      viewedDates: { [BIRTHDAY]: "2026-08-01" }
    });
  });

  it("preserves another type's date instead of clobbering it", () => {
    const afterOther = withViewedDate(null, 3, OTHER_TYPE, "2026-07-31");
    const afterBirthday = withViewedDate(afterOther, 3, BIRTHDAY, "2026-08-01");

    expect(afterBirthday.viewedDates[OTHER_TYPE]).toBe("2026-07-31");
    expect(afterBirthday.viewedDates[BIRTHDAY]).toBe("2026-08-01");
  });

  it("overwrites an existing date for the same type", () => {
    const cache = buildCache({ [BIRTHDAY]: "2026-07-31" });

    expect(withViewedDate(cache, 3, BIRTHDAY, "2026-08-01")).toEqual({
      userId: 3,
      viewedDates: { [BIRTHDAY]: "2026-08-01" }
    });
  });

  it("discards the previous user's dates when the viewer changes", () => {
    const firstUser = withViewedDate(null, 3, BIRTHDAY, "2026-08-01");
    const secondUser = withViewedDate(firstUser, 4, OTHER_TYPE, "2026-08-01");

    expect(secondUser.userId).toBe(4);
    expect(secondUser.viewedDates[BIRTHDAY]).toBeUndefined();
    expect(secondUser.viewedDates[OTHER_TYPE]).toBe("2026-08-01");
  });
});
