import { DateTime } from "luxon";

import { BulkRecordErrorLogType } from "~community/common/types/BulkUploadTypes";
import { createCSV } from "~community/common/utils/bulkUploadUtils";
import { holidayBulkUploadResponse } from "~community/people/types/HolidayTypes";

export const getFormattedYear = (date: string): string => {
  const dateFormate = new Date(date);
  const dateIOS = DateTime.fromISO(dateFormate.toISOString());
  const year = dateIOS.toLocaleString({ year: "numeric" });
  return year;
};

export const getLongFormattedMonth = (date: string): string => {
  const dateFormate = new Date(date);
  const dateIOS = DateTime.fromISO(dateFormate.toISOString());
  return dateIOS.toLocaleString({ month: "long" });
};

export const getShortDayName = (date: string): string => {
  if (date === undefined) return "";
  const dateFormate = new Date(date);
  const dateIOS = DateTime.fromISO(dateFormate.toISOString());
  const formattedDate = dateIOS.toFormat("EEE");
  return formattedDate.slice(0, 3);
};

export const holidayDatePreprocessor = (date: string): string => {
  if (date) {
    const dateFormate = new Date(date);
    const dateIOS = DateTime.fromISO(dateFormate.toISOString());
    const formattedDate = dateIOS.toFormat("dd-MM-YYYY");
    return formattedDate;
  }
  return "";
};

export const getFormattedDate = (date: string, fullDate = false): string => {
  const dateIOS = DateTime.fromISO(date);
  const day = dateIOS.toFormat("d");
  let dayWithSuffix;

  switch (Number(day)) {
    case 1:
    case 21:
    case 31:
      dayWithSuffix = `${day}st`;
      break;
    case 2:
    case 22:
      dayWithSuffix = `${day}nd`;
      break;
    case 3:
    case 23:
      dayWithSuffix = `${day}rd`;
      break;
    default:
      dayWithSuffix = `${day}th`;
  }

  if (fullDate) {
    const month = dateIOS.toFormat("MMM");
    const year = dateIOS.toFormat("yyyy");
    return `${dayWithSuffix} ${month} ${year}`;
  }

  return dayWithSuffix;
};

export const downloadHolidayBulkUploadErrorLogsCSV = (
  data: holidayBulkUploadResponse
) => {
  const headers = [
    "date",
    "workLocation",
    "name",
    "holidayDuration",
    "message"
  ];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");

      for (const item of data?.bulkRecordErrorLogs || []) {
        const date = item.holiday?.date;
        const workLocation = item.holiday?.workLocations
          ? item.holiday.workLocations.join(", ")
          : "";
        const name = item.holiday?.name;
        const HolidayDuration = item.holiday?.holidayDuration;
        const errorMessage = item.errorMessage;
        const row =
          [
            date,
            `"${workLocation}"`,
            `"${name}"`,
            `"${HolidayDuration}"`,
            `"${errorMessage}"`
          ].join(",") + "\n";

        controller.enqueue(row);
      }

      controller.close();
    }
  });

  createCSV(stream, "bulk-upload-error-log");
};

export const downloadUserBulkUploadErrorLogsCSV = (
  data: BulkRecordErrorLogType[]
) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue("email,status,message\n");
      for (const item of data) {
        const { email, status, message } = item;
        const row = `"${email}","${status}","${message}"\n`;
        controller.enqueue(row);
      }
      controller.close();
    }
  });
  createCSV(stream, "bulk-upload-error-log");
};
