import { DateTime, Duration } from "luxon";

import { TimeSlotsType } from "~community/attendance/types/timeSheetTypes";

export const convertTo24HourByDateString = (date: string) => {
  const dateTime = DateTime.fromISO(date, { zone: getCurrentTimeZone() });
  return dateTime.toFormat("HH:mm");
};

export const convertUnixTimestampToISO = (unixTimestamp: number) => {
  const dateTime = DateTime.fromMillis(unixTimestamp);
  return dateTime.toISO({ includeOffset: false });
};

export const generateTimeSlots = () => {
  const start = DateTime.fromObject({ hour: 0, minute: 0 });
  const end = start.plus({ days: 1 });
  const timeSlots = [];
  let currentTime = start;

  while (currentTime <= end) {
    timeSlots.push(currentTime.toFormat("HH:mm"));
    currentTime = currentTime.plus({ minutes: 60 });
  }

  return timeSlots;
};

export const timeStringToDecimalHours = (timeString: string) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const totalHours = hours + minutes / 60 + seconds / 3600;
  return totalHours;
};

export const formatDuration = (durationInHours: number) => {
  const duration = Duration.fromObject({ hours: durationInHours });
  const formattedDuration = duration.toFormat("h'h' mm'm'");
  return formattedDuration;
};

export const isToday = (date: string) => {
  const givenDate = DateTime.fromISO(date);
  const currentDate = DateTime.local().startOf("day");
  return givenDate.hasSame(currentDate, "day");
};

export const getDayStartTimeEndTime = () => {
  const currentDate = DateTime.local();
  const dayStart = currentDate.startOf("day").toISO({ includeOffset: false });
  const dayEnd = currentDate.endOf("day").toISO({ includeOffset: false });
  return { dayStart, dayEnd };
};

export const timeStringToSeconds = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60;
};

export const getTimeDifference = (startTime: string, endTime: string) => {
  const startSeconds = timeStringToSeconds(
    DateTime.fromISO(startTime).toFormat("HH:mm")
  );
  const endSeconds = timeStringToSeconds(
    DateTime.fromISO(endTime).toFormat("HH:mm")
  );
  return endSeconds - startSeconds;
};

export const convertToUtc = (isoTime: string | null) => {
  if (!isoTime) return "";
  const dateTime = DateTime.fromISO(isoTime);
  const utcTime = dateTime.toUTC().toISO({ includeOffset: true });
  return utcTime || "";
};

export const convertToMilliseconds = (timeString: string) => {
  const dateTime = DateTime.fromISO(timeString);
  const milliseconds = dateTime.toMillis();
  return milliseconds;
};

export const convertToDateTime = (date: string, time: string) => {
  const dateTime = DateTime.fromFormat(`${date} ${time}`, "yyyy-MM-dd hh:mm a");
  const formattedDateTime = dateTime.toISO();
  return formattedDateTime;
};

export const convertToTimeZoneISO = (isoTime: string) => {
  const dateTime = DateTime.fromISO(isoTime, { zone: "utc" });
  const localDateTime = dateTime.setZone(getCurrentTimeZone());
  return localDateTime.toISO();
};

export const getDuration = (startTime: string, endTime: string) => {
  const startTimeWithDate = DateTime.fromFormat(startTime, "hh:mm a");
  const endTimeWithDate = DateTime.fromFormat(endTime, "hh:mm a");
  const duration = endTimeWithDate.diff(startTimeWithDate, [
    "hours",
    "minutes"
  ]);
  const formattedDuration = duration.toFormat("hh'h' mm'm'");
  return formattedDuration;
};

export const getCurrentTimeZone = () => {
  const currentDate = DateTime.local();
  const timeZone = currentDate.zoneName;
  return timeZone;
};

export const convertTo12HourByDateString = (date: string) => {
  const dateTime = DateTime.fromISO(date);
  return dateTime.toFormat("hh:mm a");
};

export const convert24TimeTo12Hour = (time: string) => {
  return DateTime.fromFormat(time.slice(0, 5), "HH:mm").toFormat("hh:mm a");
};

export const addHoursToTime = (time: string, hoursToAdd: number) => {
  let dateTime = DateTime.fromISO(time);
  dateTime = dateTime.plus({ hours: hoursToAdd });
  return dateTime.toFormat("hh:mm a");
};

export const getTotalSlotTypeHours = (
  timeSlots: TimeSlotsType[],
  startTimeStr: string,
  endTimeStr: string,
  slotType: "BREAK" | "WORK"
) => {
  const startTime = DateTime.fromFormat(startTimeStr, "hh:mm a");
  let endTime = DateTime.fromFormat(endTimeStr, "hh:mm a");

  if (endTime < startTime) {
    endTime = endTime.plus({ days: 1 });
  }

  let totalBreakHours = 0;

  timeSlots.forEach((slot) => {
    const today = DateTime.local();
    let slotStartTime = DateTime.fromISO(slot.startTime).set({
      year: today.year,
      month: today.month,
      day: today.day
    });
    let slotEndTime = DateTime.fromISO(slot.endTime).set({
      year: today.year,
      month: today.month,
      day: today.day
    });

    if (slotEndTime < slotStartTime) {
      slotEndTime = slotEndTime.plus({ days: 1 });
    }

    if (slot.slotType === slotType) {
      if (
        (slotStartTime >= startTime && slotStartTime <= endTime) ||
        (slotEndTime >= startTime && slotEndTime <= endTime) ||
        (slotStartTime <= startTime && slotEndTime >= endTime)
      ) {
        const intersectionStart =
          slotStartTime >= startTime ? slotStartTime : startTime;
        const intersectionEnd = slotEndTime <= endTime ? slotEndTime : endTime;
        const duration = intersectionEnd.diff(intersectionStart, [
          "hours",
          "minutes"
        ]);
        totalBreakHours += duration.hours + duration.minutes / 60;
      }
    }
  });

  const hours = Math.floor(totalBreakHours);
  const minutes = Math.floor((totalBreakHours - hours) * 60);

  return `${hours.toString().padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m`;
};

export const isTimePm = (isoTime: Date) => {
  const dateTime = DateTime.fromJSDate(isoTime);
  return dateTime.hour >= 12;
};

export const convertToDateObjectBy12Hour = (time: string) => {
  const dateTime = DateTime.fromFormat(time, "hh:mm a");
  const formattedTime = dateTime.toJSDate();
  return formattedTime;
};

export const convertTo12HourByDateObject = (date: Date) => {
  const dateTime = DateTime.fromJSDate(date);
  const formattedTime = dateTime.toFormat("hh:mm a");
  return formattedTime;
};

export const sortTimeSlots = (timeSlots: TimeSlotsType[]) => {
  return timeSlots.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
};
