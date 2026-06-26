import { DateTime } from "luxon";

import { createCSV } from "~community/common/utils/bulkUploadUtils";
import {
  convertDateToFormat,
  getOrdinalIndicator
} from "~community/common/utils/dateTimeUtils";

import { DownloadDataAsCSVType } from "../types/AnalyticsTypes";

export const formatDateRange = (
  startDate: Date,
  endDate: Date,
  smallScreen: boolean,
  duration: number
) => {
  const startLuxonDate = DateTime.fromJSDate(startDate);
  const endLuxonDate = DateTime.fromJSDate(endDate);

  const startDay = startLuxonDate.day;
  const startMonth = startLuxonDate.toFormat("LLL");
  const startYear = startLuxonDate.year;
  const startOrdinalIndicator = getOrdinalIndicator(startDay);

  const endDay = endLuxonDate.day;
  const endMonth = endLuxonDate.toFormat("LLL");
  const endYear = endLuxonDate.year;
  const endOrdinalIndicator = getOrdinalIndicator(endDay);

  if (duration <= 1) {
    return `${startDay}${startOrdinalIndicator} ${startMonth} ${startYear}`;
  }

  if (smallScreen) {
    return `${startDay}${startOrdinalIndicator} ${startMonth} to ${endDay}${endOrdinalIndicator} ${endMonth}`;
  }

  if (startYear === endYear) {
    return `${startDay}${startOrdinalIndicator} ${startMonth} to ${endDay}${endOrdinalIndicator} ${endMonth} ${endYear}`;
  } else {
    return `${startDay} ${startMonth} ${startYear} to ${endDay}${endOrdinalIndicator} ${endMonth} ${endYear}`;
  }
};

export const formatChartDate = (date: string) =>
  convertDateToFormat(new Date(date), "dd/MM/yyyy");

export const downloadDataAsCSV = (
  { data }: DownloadDataAsCSVType,
  employeeName: string
) => {
  const stream = new ReadableStream({
    start(controller) {
      // CSV header
      controller.enqueue("PERIOD,TYPE,STATUS,DAYS,DATE REQUESTED,REASON\n");

      // CSV row
      for (const item of data) {
        const {
          startDate,
          endDate,
          leaveType,
          status,
          durationDays,
          createdDate,
          requestDesc
        } = item;
        const row = `${formatChartDate(startDate)} - ${formatChartDate(
          endDate
        )},"${leaveType.name}","${status}",${durationDays},${formatChartDate(
          createdDate
        )},"${requestDesc}"\n`;
        controller.enqueue(row);
      }

      controller.close();
    }
  });
  createCSV(stream, employeeName);
};
