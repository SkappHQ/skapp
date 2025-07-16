import { DateTime } from "luxon";

import {
  DATE_FORMAT,
  LONG_DATE_TIME_FORMAT,
  monthAbbreviations
} from "~community/common/constants/timeConstants";
import {
  DropdownListType,
  OptionType,
  TranslatorFunctionType
} from "~community/common/types/CommonTypes";

export const formatDateToISOString = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export const formatDateToISO = (date: string): string => {
  const formattedDate = convertDateToFormat(
    new Date(date),
    LONG_DATE_TIME_FORMAT
  );
  return formattedDate.split("T")[0];
};

export const getDateFromTimeStamp = (timestamp: string): string => {
  return timestamp.split("T")[0];
};

export const getOrdinalIndicator = (day: number) => {
  if (day === 1 || day === 21 || day === 31) {
    return "st";
  } else if (day === 2 || day === 22) {
    return "nd";
  } else if (day === 3 || day === 23) {
    return "rd";
  } else {
    return "th";
  }
};

export const formatDateWithOrdinalIndicator = (date: Date) => {
  const luxonDate = DateTime.fromJSDate(date);
  const day = luxonDate.day;
  const month = luxonDate.toFormat("LLL");
  const year = luxonDate.year;
  const ordinalIndicator = getOrdinalIndicator(day);

  return `${day}${ordinalIndicator} ${month} ${year}`;
};

export const formatDateTimeWithOrdinalIndicator = (dateTime: DateTime) => {
  const day = dateTime.day;
  const month = dateTime.toFormat("LLL");
  const year = dateTime.year;
  const ordinalIndicator = getOrdinalIndicator(day);

  return `${day}${ordinalIndicator} ${month} ${year}`;
};

export const formatDateTimeWithOrdinalIndicatorWithoutYear = (
  dateTime: DateTime
) => {
  const day = dateTime.day;
  const month = dateTime.toFormat("LLL");
  const ordinalIndicator = getOrdinalIndicator(day);

  return `${day}${ordinalIndicator} ${month}`;
};

export const formatDayWithOrdinalIndicator = (dateTime: DateTime) => {
  const day = dateTime.day;
  const ordinalIndicator = getOrdinalIndicator(day);

  return `${day}${ordinalIndicator}`;
};

export const formatDateWithOrdinalSuffix = (isoDateString: string): string => {
  const date = DateTime.fromISO(isoDateString);
  if (!date.isValid) return "Invalid date";

  const day = date.day;
  const monthAbbreviation = date.toFormat("MMM");
  const year = date.year;

  let ordinalSuffix = "th";
  if (day % 10 === 1 && day !== 11) ordinalSuffix = "st";
  else if (day % 10 === 2 && day !== 12) ordinalSuffix = "nd";
  else if (day % 10 === 3 && day !== 13) ordinalSuffix = "rd";

  return `${day}${ordinalSuffix} ${monthAbbreviation} ${year}`;
};

export const getLocalDate = (date: Date | string): string => {
  if (typeof date === "string")
    return DateTime.fromISO(date).toISODate() as string;
  return convertDateToFormat(date, DATE_FORMAT);
};

export const convertDateToFormat = (date: Date, format: string): string =>
  DateTime.fromJSDate(date).toFormat(format);

export const generateTimeArray = () => {
  const timeArray = [];
  let currentTime = new Date();
  currentTime.setHours(0, 0, 0, 0);

  const endTime = new Date();
  endTime.setHours(23, 45, 0, 0);

  while (currentTime <= endTime) {
    const label = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    const value = currentTime.toTimeString().split(" ")[0];
    timeArray.push({ label, value });

    currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
  }

  return timeArray;
};

export const getAdjacentYearsWithCurrent = () => {
  const now = DateTime.now();
  const year = now.year - 1;
  return Array.from({ length: 3 }, (_, index) => {
    const value = (year + index).toString();
    return { label: value, value };
  });
};

export const currentYear = new Date().getFullYear();

export const nextYear = new Date().getFullYear() + 1;

export const options: OptionType[] = [
  { id: 1, name: currentYear.toString() },
  { id: 2, name: (currentYear + 1).toString() }
];

export const getStandardDate = (date: string): string | undefined => {
  if (date !== "" && date !== undefined)
    return `${getFormattedDate(date)} ${getFormattedMonth(
      date,
      "short"
    )} ${getFormattedYear(date)} `;
};

export const getFormattedDate = (date: string): string => {
  const dateIOS = DateTime.fromISO(date);
  const day = dateIOS.toLocaleString({ day: "numeric" });

  switch (Number(day)) {
    case 1:
    case 21:
    case 31:
      return `${day}st`;
    case 2:
    case 22:
      return `${day}nd`;
    case 3:
    case 23:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

export const getFormattedMonth = (
  date: string,
  format: "short" | "long" = "short"
): string => {
  const dateFormate = new Date(date);
  const dateIOS = DateTime.fromISO(dateFormate.toISOString());
  return dateIOS.toLocaleString({ month: format });
};

export const getFormattedYear = (date: string): string => {
  const dateFormate = new Date(date);
  const dateIOS = DateTime.fromISO(dateFormate.toISOString());
  const year = dateIOS.toLocaleString({ year: "numeric" });
  return year;
};

export const convertDateToUTC = (date: string) => {
  return DateTime.fromISO(date, { zone: "UTC" }).toISO();
};

export const getStartAndEndOfYear = (
  format?: string
): {
  startDateOfYear: string | DateTime;
  endDateOfYear: string | DateTime;
} => {
  const startOfYear = DateTime.local().startOf("year");
  const endOfYear = DateTime.local().endOf("year");
  if (format) {
    return {
      startDateOfYear: startOfYear.toFormat(format),
      endDateOfYear: endOfYear.toFormat(format)
    };
  } else {
    return {
      startDateOfYear: startOfYear,
      endDateOfYear: endOfYear
    };
  }
};

export const getFirstDateOfYear = (year: number) => {
  return DateTime.fromObject({ year, month: 1, day: 1 }).startOf("day");
};

export const getStartAndEndOfCurrentWeek = () => {
  const startOfWeek = DateTime.local().startOf("week").toJSDate();
  const endOfWeek = DateTime.local()
    .endOf("week")
    .minus({ hours: 23, minutes: 59, seconds: 59, milliseconds: 999 })
    .toJSDate();
  return { startOfWeek, endOfWeek };
};

export const getStartAndEndOfCurrentMonth = () => {
  const currentMonth = DateTime.local();
  const startOfMonth = currentMonth.startOf("month").toJSDate();
  const endOfMonth = currentMonth
    .endOf("month")
    .minus({ hours: 23, minutes: 59, seconds: 59, milliseconds: 999 })
    .toJSDate();
  return { startOfMonth, endOfMonth };
};

export const isDateGraterThanToday = (date: string) => {
  const today = DateTime.local().startOf("day");
  const dateToCompare = DateTime.fromISO(date);
  return dateToCompare > today;
};

export const getMinDateOfYear = (year?: number) => {
  return DateTime.fromObject({
    year: year ?? DateTime.local().year,
    month: 1,
    day: 1
  });
};

export const getMaxDateOfYear = (year?: number) => {
  return DateTime.fromObject({
    year: year ?? DateTime.local().year,
    month: 12,
    day: 31
  });
};

export const getTimeElapsedSinceDate = (startDate: string) => {
  const starts = DateTime.fromISO(startDate);
  const ends = DateTime.now();

  if (ends < starts) {
    return "0y 0m 0d";
  }

  const diff = ends.diff(starts, ["years", "months", "days"]);
  return `${Math.round(diff.years)}y ${Math.round(diff.months)}m ${Math.round(diff.days)}d`;
};

export const convertDateToDateTime = (date: Date): DateTime => {
  return DateTime.fromJSDate(date);
};

export const convertDateTimeToDate = (dateTime: DateTime): Date => {
  return dateTime.toJSDate();
};

export const isDateTimeSimilar = (
  dateOne: DateTime,
  dateTwo: DateTime
): boolean => {
  return dateOne.hasSame(dateTwo, "day");
};

export const getTimeOffset = () => {
  const now = DateTime.now();
  const offsetMinutes = now.offset;
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes < 0 ? "-" : "+";
  const offsetString = `${sign}${hours?.toString()?.padStart(2, "0")}:${minutes
    ?.toString()
    ?.padStart(2, "0")}`;
  return offsetString;
};

export const addHours = (
  initialTime: string,
  format: string,
  hours: number
) => {
  let dateTime = DateTime.fromFormat(initialTime, "HH:mm");
  dateTime = dateTime.plus({ hours });
  return dateTime.toFormat(format);
};

export const getCurrentMonth = (): number => {
  return DateTime.local().month;
};

export const getMonthName = (monthNumber: number) => {
  const dt = DateTime.local(2000, monthNumber, 1);
  const monthName = dt.toLocaleString({ month: "long" });
  return monthName;
};

export const getYearStartAndEndDates = (year: number) => {
  const startDate = DateTime.fromObject({ year, month: 1, day: 1 });
  const endDate = startDate.endOf("year");
  return {
    start: startDate.toISODate(),
    end: endDate.toISODate()
  };
};

export const convertToYYYYMMDDFromDate = (date: Date) => {
  if (date) {
    return DateTime.fromJSDate(new Date(date)).toFormat("yyyy-MM-dd");
  }
  return "";
};

export const convertToYYYYMMDDFromDateTime = (dateTime: DateTime) => {
  if (dateTime) {
    return dateTime.toFormat("yyyy-MM-dd");
  }
  return "";
};

export const convertYYYYMMDDToDateTime = (dateString: string): DateTime => {
  return DateTime.fromFormat(dateString, "yyyy-MM-dd");
};

export const getMonthStartAndEndDates = (month: number) => {
  const startDate = DateTime.local(DateTime.now().year, month, 1).startOf(
    "month"
  );

  const endDate = startDate.endOf("month");

  return {
    start: startDate.toFormat("yyyy-MM-dd"),
    end: endDate.toFormat("yyyy-MM-dd")
  };
};

export const getCurrentDateAtMidnight = () => {
  return DateTime.now().startOf("day");
};

/**
 * Parses a date string with the current year and converts it to a DateTime object.
 * The input date string should contain a day and a month, separated by a space.
 * The month should be in a three-letter format (e.g., "Jan", "Feb").
 * The function normalizes the input string by removing non-alphanumeric characters
 * and converting it to uppercase.
 *
 * @param dateString - The date string to parse and convert.
 * @returns A DateTime object representing the parsed date with the current year,
 * or an invalid DateTime object if the input string is invalid.
 */
export function parseStringWithCurrentYearAndConvertToDateTime(
  dateString: string
): DateTime {
  if (!dateString) {
    return DateTime.invalid("Invalid date string");
  }

  const normalizedString = dateString
    .replace(/[^A-Za-z0-9\s]/g, "")
    .toUpperCase();

  const [day, month] = normalizedString.split(" ");

  if (!day || !month) {
    return DateTime.invalid("Invalid date string");
  }

  const parsedDay = parseInt(day, 10);
  const parsedMonth = DateTime.fromFormat(month, "LLL").month;

  if (isNaN(parsedDay) || parsedMonth === 0) {
    return DateTime.invalid("Invalid date string");
  }

  return DateTime.now().set({
    year: DateTime.now().year,
    month: parsedMonth,
    day: parsedDay,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
}

export const getStartAndEndDateOfTheMonth = () => {
  const startDate = DateTime.now().startOf("month").toFormat(DATE_FORMAT);
  const endDate = DateTime.now().endOf("month").toFormat(DATE_FORMAT);
  return {
    start: startDate,
    end: endDate
  };
};

export const getDateForPeriod = (
  periodType: "day" | "week" | "month" | "year",
  type: "start" | "end"
) => {
  if (type === "start") {
    return DateTime.now().startOf(periodType).toISODate() || "";
  } else {
    return DateTime.now().endOf(periodType).toISODate() || "";
  }
};

export const getAsDaysString = (input: string | number) => {
  const number = typeof input === "number" ? input : parseFloat(input);
  if (number <= 0 || Number.isNaN(number)) {
    throw new Error("Input is not a valid number greater than 0");
  }

  return `${number} ${number > 0 && number <= 1 ? "Day" : "Days"}`;
};

export const getRecentYearsInStrings = () => {
  const currentYear = DateTime.local().year;
  const nextYear = currentYear + 1;

  return [
    {
      label: currentYear.toString(),
      value: currentYear.toString()
    },
    {
      label: nextYear.toString(),
      value: nextYear.toString()
    }
  ];
};

export const getCurrentAndNextYear = () => {
  const now = DateTime.now();
  const year = now.year;
  return Array.from({ length: 2 }, (_, index) => {
    const value = (year + index).toString();
    return { label: value, value };
  });
};

export const calculateMinMonth = (
  isPhoneScreen: boolean,
  isTabScreen: boolean,
  min: number
) => {
  if (isPhoneScreen) {
    return min;
  } else if (isTabScreen) {
    return min - 3 < 0 ? 0 : min - 3;
  } else {
    return 0;
  }
};

export const calculateMaxMonth = (
  isPhoneScreen: boolean,
  isTabScreen: boolean,
  max: number
) => {
  if (isPhoneScreen) {
    return max;
  } else if (isTabScreen) {
    return max + 3 > monthAbbreviations?.length - 1
      ? monthAbbreviations?.length - 1
      : max + 3;
  } else {
    return monthAbbreviations?.length - 1;
  }
};

export const formatDateRange = (
  startDate: Date,
  endDate: Date,
  smallScreen: boolean,
  duration: number
): string => {
  const start = DateTime.fromJSDate(startDate);
  const end = DateTime.fromJSDate(endDate);

  if (duration <= 1) {
    return `${start.day}${getOrdinalIndicator(start.day)} ${start.toFormat("LLL")} ${start.year}`;
  }

  const startFormat = `${start.day}${getOrdinalIndicator(start.day)} ${start.toFormat("LLL")}`;
  const endFormat = `${end.day}${getOrdinalIndicator(end.day)} ${end.toFormat("LLL")}`;

  if (smallScreen) {
    return `${startFormat} to ${endFormat}`;
  }

  if (start.year === end.year) {
    return `${startFormat} to ${endFormat} ${start.year}`;
  }

  return `${startFormat} ${start.year} to ${endFormat} ${end.year}`;
};

export const generateTimezoneList = (): DropdownListType[] => {
  const date = new Date();

  const timezones = Intl.supportedValuesOf("timeZone");

  const options = timezones
    .map((timezone) => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          timeZoneName: "longOffset",
          hour12: false,
          hour: "numeric"
        });

        const formattedOffset =
          formatter
            .format(date)
            .split(" ")
            .pop()
            ?.replace("GMT", "")
            .replace(":00", "") || "+0";

        return {
          label: `(GMT${formattedOffset}) ${timezone}`,
          value: timezone
        };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean) as DropdownListType[];

  return options.sort((a, b) => {
    const offsetA = (a.label as string).match(/GMT([+-]\d+)/)?.[1] || "0";
    const offsetB = (b.label as string).match(/GMT([+-]\d+)/)?.[1] || "0";
    return parseInt(offsetA) - parseInt(offsetB);
  });
};

// example: Input - 2024-12-02T14:10:00.036411
// example: Output - after Today at 2:10 PM
export const fromDateToRelativeTime = (
  date: string,
  translateText: TranslatorFunctionType,
  language: string
): string => {
  const dateTime = DateTime.fromISO(date).setLocale(language);
  const relativeCalendar = dateTime ? dateTime.toRelativeCalendar() : "";
  const str: string = `${relativeCalendar ? relativeCalendar.toString() : "Unknown date"} at ${dateTime.toFormat("h:mm a")}`;
  const strArray = str.split(" ");
  const firstWord = strArray[0].charAt(0).toUpperCase() + strArray[0].slice(1);
  strArray.shift();
  strArray.unshift(firstWord);
  return strArray.join(" ");
};

export const getCurrentWeekNumber = () => {
  return DateTime.now().weekNumber;
};

// Example: "2024-03-05" → "5th March 2024"
export const formatISODateWithSuffix = (isoString: string): string => {
  const date = DateTime.fromISO(isoString, { zone: "utc" });
  const day = date.day;
  const suffix = getDaySuffix(day);

  return `${day}${suffix} ${date.toFormat("MMMM yyyy")}`;
};

// Example: "2024-03-05" → "March 2024"
export const formatISODateToMonthYear = (isoString: string): string => {
  if (isoString !== "") {
    const date = DateTime.fromISO(isoString, { zone: "utc" });

    return `${date.toFormat("MMMM")} ${date.year}`;
  }

  return "";
};

const getDaySuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const getAllMonthsAsString = (
  format: "short" | "long" = "short",
  language: string = "en"
): string[] => {
  const months = [];
  for (let i = 1; i <= 12; i++) {
    const dateTime = DateTime.fromObject({ month: i }).setLocale(language);
    months.push(dateTime.toFormat(format === "short" ? "LLL" : "MMMM"));
  }
  return months;
};

export const formatTimestampWithTime = (timestamp: string): string => {
  const dateTime = DateTime.fromISO(timestamp);
  if (!dateTime.isValid) return "Invalid date";

  const day = dateTime.day;
  let ordinalSuffix = "th";
  if (day % 10 === 1 && day !== 11) ordinalSuffix = "st";
  else if (day % 10 === 2 && day !== 12) ordinalSuffix = "nd";
  else if (day % 10 === 3 && day !== 13) ordinalSuffix = "rd";

  return `${day}${ordinalSuffix} ${dateTime.toFormat("MMM yyyy HH:mm a")}`;
};

export const formatDateByTemplate = (date: Date, rawFormat: string): string => {
  const format = rawFormat.replace(/_/g, "/");

  const yyyy = date.getFullYear().toString();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return format.replace(/YYYY/g, yyyy).replace(/MM/g, mm).replace(/DD/g, dd);
};

export const isPastYear = (year: number): boolean => {
  return year < DateTime.local().year;
};

export const getLocaleDateString = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};
