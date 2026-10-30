import { DateTime } from "luxon";

import {
  ACTIVITY_TIME_SLOT_MINUTES,
  ACTIVITY_TIME_VALUE_FORMAT
} from "~community/crm/activities/constants/activityConstants";

export const getTimeSlotStart = (dateTime: DateTime): DateTime =>
  dateTime.set({
    minute: dateTime.minute - (dateTime.minute % ACTIVITY_TIME_SLOT_MINUTES)
  });

export const toPickerDate = (isoDate: string | null): Date | null =>
  isoDate ? DateTime.fromISO(isoDate).startOf("day").toJSDate() : null;

export const toDateFieldValue = (date?: Date): string | null =>
  date ? DateTime.fromJSDate(date).startOf("day").toUTC().toISO() : null;

export const toActivityInstant = (
  isoDate: string,
  time: string
): string | null => {
  if (!time) return null;

  const { hour, minute } = DateTime.fromFormat(
    time,
    ACTIVITY_TIME_VALUE_FORMAT
  );

  return DateTime.fromISO(isoDate)
    .set({ hour, minute })
    .startOf("minute")
    .toUTC()
    .toISO();
};
