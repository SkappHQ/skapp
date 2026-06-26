import { DateTime } from "luxon";

import { isNotAWorkingDate } from "~community/common/utils/calendarDateRangePickerUtils";
import {
  convertDateTimeToDate,
  convertDateToDateTime,
  convertDateToFormat,
  getStartAndEndOfYear,
  isDateTimeSimilar
} from "~community/common/utils/dateTimeUtils";
import {
  Holiday,
  HolidayDurationType
} from "~community/people/types/HolidayTypes";

interface HandleDateChangeProps {
  date: DateTime | null;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  isRangePicker: boolean;
  setAnchorEl: (element: HTMLElement | null) => void;
}

export const handleDateChange = ({
  date,
  isRangePicker,
  selectedDates,
  setSelectedDates,
  setAnchorEl
}: HandleDateChangeProps) => {
  if (!date) return;

  const dateWithoutTime = date.set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });

  const jsDate = convertDateTimeToDate(dateWithoutTime);

  if (isRangePicker) {
    // Range selection logic
    if (selectedDates.length === 2) {
      setSelectedDates([jsDate]); // Start a new range
    } else {
      if (selectedDates.length === 1) {
        if (date > DateTime.fromJSDate(selectedDates[0])) {
          setSelectedDates([selectedDates[0], jsDate]);
        } else {
          setSelectedDates([jsDate, selectedDates[0]]);
        }
        setAnchorEl(null); // Close after setting range
      } else {
        setSelectedDates([jsDate]);
      }
    }
  } else {
    // Single date selection logic
    setSelectedDates([jsDate]);
    setAnchorEl(null); // Close after selecting single date
  }
};

interface GetLabelProps {
  selectedDates: Date[];
  isRangePicker: boolean;
  startDate?: Date;
  endDate?: Date;
}

export const getChipLabel = ({
  selectedDates,
  isRangePicker,
  startDate,
  endDate
}: GetLabelProps) => {
  const { startDateOfYear, endDateOfYear } = getStartAndEndOfYear("dd.MM.yyyy");

  if (isRangePicker) {
    // Range picker label logic
    if (!selectedDates[0] && !selectedDates[1]) {
      if (startDate && endDate) {
        const formattedStartDate = convertDateToFormat(
          new Date(startDate),
          "dd.MM.yyyy"
        );
        const formattedEndDate = convertDateToFormat(
          new Date(endDate),
          "dd.MM.yyyy"
        );
        return `${formattedStartDate}-${formattedEndDate}`;
      } else {
        return `${startDateOfYear as string}-${endDateOfYear as string}`;
      }
    } else if (selectedDates[0] && !selectedDates[1]) {
      const formattedStartDate = convertDateToFormat(
        selectedDates[0],
        "dd.MM.yyyy"
      );
      return `${formattedStartDate}-${endDateOfYear as string}`;
    } else {
      const formattedStartDate = convertDateToFormat(
        selectedDates[0],
        "dd.MM.yyyy"
      );
      const formattedEndDate = convertDateToFormat(
        selectedDates[1],
        "dd.MM.yyyy"
      );
      return `${formattedStartDate}-${formattedEndDate}`;
    }
  } else {
    // Single date picker label logic
    if (!selectedDates[0]) {
      return convertDateToFormat(new Date(), "dd.MM.yyyy");
    } else {
      return convertDateToFormat(selectedDates[0], "dd.MM.yyyy");
    }
  }
};

interface GetSelectionClassesProps {
  day: DateTime;
  selectedDates: Date[] | DateTime[];
  workingDays?: string[] | undefined;
  holidaysForDay?: Holiday[] | null;
}

export const getSelectionClasses = ({
  selectedDates,
  workingDays,
  holidaysForDay,
  day
}: GetSelectionClassesProps): string => {
  let startDate;
  let endDate;

  const isSelectDatesTypeOfDates =
    Array.isArray(selectedDates) &&
    selectedDates.every((date) => date instanceof Date);

  if (isSelectDatesTypeOfDates) {
    startDate = convertDateToDateTime(selectedDates[0]);
    endDate = convertDateToDateTime(selectedDates[1]);
  } else {
    startDate = selectedDates[0];
    endDate = selectedDates[1];
  }

  if (selectedDates.length === 2) {
    if (isDateTimeSimilar(day, startDate) || isDateTimeSimilar(day, endDate)) {
      return "Mui-user-selection";
    } else {
      const isDateInRange = day > startDate && day < endDate;

      if (isSelectDatesTypeOfDates) {
        if (isDateInRange) {
          return "Mui-full-day-range-selection";
        }
      } else {
        const isDateEnabled = !isNotAWorkingDate({
          date: day,
          workingDays: workingDays ?? []
        });

        if (isDateEnabled && isDateInRange) {
          if (holidaysForDay !== undefined && holidaysForDay?.length) {
            const rangeClasses = holidaysForDay.map((holiday) => {
              switch (holiday?.holidayDuration) {
                case HolidayDurationType.FULLDAY:
                  return "";
                case HolidayDurationType.HALFDAY_MORNING:
                  return "Mui-half-day-evening-range-selection";
                case HolidayDurationType.HALFDAY_EVENING:
                  return "Mui-half-day-morning-range-selection";
                default:
                  return "";
              }
            });

            const uniqueRangeClasses = new Set(rangeClasses);

            if (
              uniqueRangeClasses.has("") &&
              (uniqueRangeClasses.has("Mui-half-day-morning-range-selection") ||
                uniqueRangeClasses.has("Mui-half-day-evening-range-selection"))
            ) {
              return "";
            }

            return Array.from(uniqueRangeClasses).join(" ");
          }

          return "Mui-full-day-range-selection";
        }
      }
    }
  } else if (selectedDates.length === 1) {
    if (isDateTimeSimilar(startDate, day)) {
      return "Mui-user-selection";
    }
  }

  return "";
};
