import {
  ManagerTimesheetHeaderType,
  TimeRecordDataResponseType
} from "~community/attendance/types/timeSheetTypes";
import { HTMLTableHeaderTypes } from "~community/common/types/CommonTypes";
import { convertToYYYYMMDDFromDate } from "~community/common/utils/dateTimeUtils";
import { Holiday } from "~community/people/types/HolidayTypes";

export const getHeadersWithSubtitles = ({
  translateText,
  recordData,
  getHolidaysArrayByDate
}: {
  translateText: (keys: string[]) => string;
  recordData?: TimeRecordDataResponseType;
  getHolidaysArrayByDate: (date: Date) => Holiday[];
}): HTMLTableHeaderTypes[] => {
  const baseColumns = [
    {
      id: "name",
      label: translateText(["nameHeaderTxt"]),
      sticky: true,
    }
  ];

  if (
    recordData !== undefined &&
    recordData?.headerList !== undefined &&
    recordData?.headerList?.length > 0
  ) {
    const columns = recordData.headerList.map(
      (header: ManagerTimesheetHeaderType, index: number) => {
        const holiday = getHolidaysArrayByDate(header.headerDateObject) || [];

        const isHoliday = holiday.length > 0;

        return {
          id: convertToYYYYMMDDFromDate(header.headerDateObject),
          label: header.headerDate?.toUpperCase(),
          sticky: false,
          subtitle: {
            isChip: isHoliday,
            text: isHoliday ? holiday[0].name : "",
            emoji: isHoliday ? "1f3d6-fe0f" : "",
            duration: isHoliday ? holiday[0].holidayDuration : undefined
          }
        };
      }
    );

    return [...baseColumns, ...columns];
  }

  return baseColumns;
};
