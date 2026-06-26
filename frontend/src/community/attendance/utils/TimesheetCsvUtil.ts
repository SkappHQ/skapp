import {
  DailyLogType,
  TimeRecordDataResponseType
} from "~community/attendance/types/timeSheetTypes";
import { createCSV } from "~community/common/utils/bulkUploadUtils";
import {
  convertDateToFormat,
  getStartAndEndOfYear,
  isDateGraterThanToday
} from "~community/common/utils/dateTimeUtils";

import { convertTo24HourByDateString } from "./TimeUtils";

export const downloadManagerTimesheetCsv = (
  recordData: TimeRecordDataResponseType,
  startTime: string,
  endTime: string,
  teamName?: string,
  orgName?: string
) => {
  const { startDateOfYear, endDateOfYear } = getStartAndEndOfYear("yyyy-MM-dd");
  const stream = new ReadableStream({
    start(controller) {
      if (teamName || orgName) {
        controller.enqueue(`Timesheet of ${teamName || orgName}\n`);
      } else {
        controller.enqueue(`Timesheet of all assigned employees \n`);
      }
      controller.enqueue(
        `For the period from ${convertDateToFormat(
          new Date(startTime || (startDateOfYear as string)),
          "dd/MM/yyyy"
        )} to ${convertDateToFormat(
          new Date(endTime || (endDateOfYear as string)),
          "dd/MM/yyyy"
        )}\n`
      );
      controller.enqueue("\n");
      controller.enqueue("\n");
      let headerDateString = "";
      recordData?.headerList?.forEach((header) => {
        const formattedDate = convertDateToFormat(
          new Date(header?.headerDateObject),
          "dd/MM/yyyy"
        );
        headerDateString = headerDateString + formattedDate + ",";
      });
      headerDateString = headerDateString.slice(0, -1);
      const headerString =
        "NAME,JOB FAMILY,JOB ROLE," + headerDateString + "\n";
      controller.enqueue(headerString);
      for (const item of recordData?.items || []) {
        const { employee, timeRecords } = item;
        const employeeDetailsString = `${employee?.employee?.firstName} ${employee?.employee?.lastName},${employee?.employee?.jobRole?.name},${employee?.employee?.jobLevel?.name},`;
        let workedHoursString = "";
        timeRecords?.forEach((record) => {
          workedHoursString =
            workedHoursString +
            (isDateGraterThanToday(record?.date)
              ? "-,"
              : record?.workedHours.toFixed(2).toString() + ",");
        });
        workedHoursString = workedHoursString.slice(0, -1);
        const rowString = employeeDetailsString + workedHoursString + "\n";
        controller.enqueue(rowString);
      }
      controller.close();
    }
  });
  createCSV(stream, teamName || orgName || "Timesheet");
};

export const downloadEmployeeDailyLogCsv = (
  dailyLogData: DailyLogType[],
  employeeName: string,
  startTime: string,
  endTime: string
) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(`Timesheet of ${employeeName}\n`);
      controller.enqueue(
        `For the period from ${convertDateToFormat(
          new Date(startTime),
          "dd/MM/yyyy"
        )} to ${convertDateToFormat(new Date(endTime), "dd/MM/yyyy")}\n`
      );
      controller.enqueue("\n");
      controller.enqueue("\n");
      controller.enqueue("DATE,CLOCK IN,CLOCK OUT,WORKED HOURS,BREAK HOURS\n");
      for (const item of dailyLogData) {
        const { date, workedHours, breakHours, timeSlots } = item;

        const row = `${convertDateToFormat(new Date(date), "dd/MM/yyyy")},${
          timeSlots[0]?.startTime
            ? convertTo24HourByDateString(timeSlots[0]?.startTime)
            : "-"
        },${
          timeSlots[timeSlots?.length - 1]?.endTime
            ? convertTo24HourByDateString(
                timeSlots[timeSlots?.length - 1]?.endTime
              )
            : "-"
        },${workedHours === 0 ? "-" : workedHours.toFixed(2)},${breakHours === 0 ? "-" : breakHours?.toFixed(2)}\n`;
        controller.enqueue(row);
      }
      controller.close();
    }
  });
  createCSV(stream, employeeName);
};
