import {
  DailyLogType,
  ManagerTimesheetHeaderType,
  TimeRecordDataResponseType,
  TimeRequestDataResponseType,
  TimeRequestDataType,
  TimeSlotsType
} from "~community/attendance/types/timeSheetTypes";
import {
  convertTo24HourByDateString,
  convertToTimeZoneISO,
  convertUnixTimestampToISO
} from "~community/attendance/utils/TimeUtils";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";

export const timeRequestPreProcessor = (
  requestResponce: TimeRequestDataResponseType,
  zone?: string
) => {
  const { items, ...rest } = requestResponce;
  const newRequestArray = items.reduce<TimeRequestDataType[]>((acc, record) => {
    const {
      initialClockIn,
      initialClockOut,
      requestedEndTime,
      requestedStartTime,
      ...rest
    } = record;

    const isoClockIn = initialClockIn
      ? convertUnixTimestampToISO(initialClockIn as number, zone)
      : null;
    const isoClockOut = initialClockOut
      ? convertUnixTimestampToISO(initialClockOut as number, zone)
      : null;
    const isoRequestedEndTime = requestedEndTime
      ? convertUnixTimestampToISO(requestedEndTime as number, zone)
      : null;
    const isoRequestedStartTime = requestedStartTime
      ? convertUnixTimestampToISO(requestedStartTime as number, zone)
      : null;

    const newRecord = {
      initialClockIn: isoClockIn
        ? convertTo24HourByDateString(isoClockIn, zone)
        : "",
      initialClockOut: isoClockOut
        ? convertTo24HourByDateString(isoClockOut, zone)
        : "",
      requestedEndTime: isoRequestedEndTime
        ? convertTo24HourByDateString(isoRequestedEndTime, zone)
        : "",
      requestedStartTime: isoRequestedStartTime
        ? convertTo24HourByDateString(isoRequestedStartTime, zone)
        : "",
      date: isoRequestedEndTime ? isoRequestedEndTime : "",
      ...rest
    };
    acc.push(newRecord);
    return acc;
  }, []);
  return {
    items: newRequestArray,
    ...rest
  };
};

export const timeRecordPreProcessor = (
  requestResponse: TimeRecordDataResponseType
) => {
  const { items, ...rest } = requestResponse;

  const headerList: ManagerTimesheetHeaderType[] = [];
  const newItemList = items?.map((item) => {
    return {
      employee: item?.employee,
      timeRecords: item?.timeRecords
    };
  });
  newItemList?.[0]?.timeRecords?.forEach((item) => {
    headerList.push({
      headerDate: convertDateToFormat(new Date(item?.date), "dd EEE"),
      headerDateObject: new Date(item?.date)
    });
  });
  return {
    items: newItemList,
    headerList,
    ...rest
  };
};

export const dailyLogPreProcessor = (
  dailyLogList: DailyLogType[],
  zone?: string
) => {
  const newLogArray: DailyLogType[] = dailyLogList?.reduce<DailyLogType[]>(
    (acc, dailyLog) => {
      const { timeSlots, ...rest } = dailyLog;
      const newTimeSlots: TimeSlotsType[] = [];
      timeSlots.forEach((item) => {
        const { startTime, endTime, ...itemRest } = item;
        newTimeSlots.push({
          startTime: convertToTimeZoneISO(startTime, zone) || "",
          endTime: convertToTimeZoneISO(endTime, zone) || "",
          ...itemRest
        });
      });
      const newRecord = {
        timeSlots: newTimeSlots,
        ...rest
      };
      acc.push(newRecord);
      return acc;
    },
    []
  );
  const filteredArray = newLogArray
    ?.reverse()
    ?.filter((item) => new Date(item?.date) <= new Date());
  return filteredArray;
};
