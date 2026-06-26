import { DateTime } from "luxon";
import { useCallback } from "react";

import { useGetAllHolidays } from "~community/people/api/HolidayApi";
import { Holiday } from "~community/people/types/HolidayTypes";

import { convertYYYYMMDDToDateTime } from "../utils/dateTimeUtils";

const useGetHoliday = () => {
  const { data: holidays } = useGetAllHolidays();

  // console.log("useGetHoliday: ", holidays);

  const getHolidaysArrayByDate = useCallback(
    (date: Date): Holiday[] => {
      if (!holidays) return [];

      const holidayList = holidays.filter((holiday) => {
        const holidayDate = convertYYYYMMDDToDateTime(holiday.date).toJSDate();

        return DateTime.fromJSDate(holidayDate).hasSame(
          DateTime.fromJSDate(date),
          "day"
        );
      });

      return holidayList;
    },
    [holidays]
  );

  return { getHolidaysArrayByDate };
};

export default useGetHoliday;
