import { DateTime, Interval } from "luxon";

export const CALL_TIME_SLOT_MINUTES = 30;

export const CALL_TIME_LOCALE = "en-US";

export const CALL_TIME_VALUE_FORMAT = "HH:mm";

export const CALL_TIME_LABEL_FORMAT = "hh:mm a";

const dayStart = DateTime.utc().startOf("day").setLocale(CALL_TIME_LOCALE);

export const CALL_TIME_OPTIONS = Interval.fromDateTimes(
  dayStart,
  dayStart.plus({ days: 1 })
)
  .splitBy({ minutes: CALL_TIME_SLOT_MINUTES })
  .map(({ start }) => {
    const value = start!.toFormat(CALL_TIME_VALUE_FORMAT);

    return {
      id: value,
      value,
      label: start!.toFormat(CALL_TIME_LABEL_FORMAT)
    };
  });
