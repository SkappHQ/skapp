import { DateTime, Interval } from "luxon";

import {
  TIME_FORMAT_12_HOUR_PADDED,
  TIME_FORMAT_24_HOUR
} from "~community/common/constants/timeConstants";
import { ACTIVITY_TIME_SLOT_MINUTES } from "~community/crm/activities/constants/activityConstants";

export const getTimeSlotStart = (dateTime: DateTime): DateTime =>
  dateTime.set({
    minute: dateTime.minute - (dateTime.minute % ACTIVITY_TIME_SLOT_MINUTES)
  });

export const getActivityTimeOptions = () => {
  const dayStart = DateTime.utc().startOf("day");

  return Interval.fromDateTimes(dayStart, dayStart.plus({ days: 1 }))
    .splitBy({ minutes: ACTIVITY_TIME_SLOT_MINUTES })
    .map(({ start }) => {
      const value = start!.toFormat(TIME_FORMAT_24_HOUR);

      return {
        id: value,
        value,
        label: start!.toFormat(TIME_FORMAT_12_HOUR_PADDED)
      };
    });
};

export const toPickerDate = (isoDate: string): Date =>
  DateTime.fromISO(isoDate).startOf("day").toJSDate();

export const toDateFieldValue = (date: Date): string | null =>
  DateTime.fromJSDate(date).startOf("day").toUTC().toISO();

export const toActivityInstant = (
  isoDate: string,
  time: string
): string | null => {
  const { hour, minute } = DateTime.fromFormat(time, TIME_FORMAT_24_HOUR);

  return DateTime.fromISO(isoDate)
    .set({ hour, minute })
    .startOf("minute")
    .toUTC()
    .toISO();
};
