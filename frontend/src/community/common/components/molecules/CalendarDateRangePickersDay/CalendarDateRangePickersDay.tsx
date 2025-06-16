import { Theme, useTheme } from "@mui/material";
import {
  PickersDay as MuiPickersDay,
  PickersDayProps
} from "@mui/x-date-pickers";
import { DateTime } from "luxon";
import { useMemo } from "react";

import { MONTH_YEAR_FULL } from "~community/attendance/constants/constants";
import styles from "~community/common/components/molecules/DateRangePickersDay/styles";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getHolidayClasses,
  getLeaveRequestClasses
} from "~community/common/utils/calendarDateRangePickerStyleUtils";
import {
  getHolidaysForDay,
  getMyLeaveRequestForDay
} from "~community/common/utils/calendarDateRangePickerUtils";
import { getSelectionClasses } from "~community/common/utils/dateRangePickerUtils";
import { getOrdinalIndicator } from "~community/common/utils/dateTimeUtils";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import { Holiday } from "~community/people/types/HolidayTypes";

interface Props {
  pickerDaysProps: PickersDayProps<DateTime>;
  selectedDates: DateTime[];
  onDayClick: (date: DateTime<boolean>) => void;
  isRangePicker: boolean;
  myLeaveRequests?: MyLeaveRequestPayloadType[];
  workingDays?: string[] | undefined;
  allHolidays: Holiday[] | undefined;
}

const CalendarDateRangePickersDay = ({
  pickerDaysProps,
  selectedDates,
  onDayClick,
  isRangePicker,
  myLeaveRequests,
  workingDays,
  allHolidays
}: Props) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateAria = useTranslator("leaveAria", "applyLeave", "calendar");

  const { day, outsideCurrentMonth, ...other } = pickerDaysProps;

  const holidaysForDay = useMemo(() => {
    return getHolidaysForDay({
      allHolidays,
      date: day
    });
  }, [day, allHolidays]);

  const myLeaveRequestForDay = useMemo(() => {
    return getMyLeaveRequestForDay({
      myLeaveRequests,
      date: day
    });
  }, [day, myLeaveRequests]);

  const muiClassNames = useMemo(() => {
    let classNames: string[] = [];

    if (holidaysForDay?.length) {
      classNames.push(getHolidayClasses(holidaysForDay));
    }

    if (myLeaveRequestForDay) {
      classNames.push(
        getLeaveRequestClasses({
          date: day,
          workingDays,
          leaveRequests: myLeaveRequestForDay,
          holidays: holidaysForDay
        })
      );
    }

    if (isRangePicker) {
      classNames.push(
        getSelectionClasses({
          selectedDates,
          workingDays,
          holidaysForDay,
          day
        })
      );
    }

    return classNames.join(" ");
  }, [
    holidaysForDay,
    myLeaveRequestForDay,
    isRangePicker,
    selectedDates,
    day,
    workingDays
  ]);

  const isStart =
    selectedDates.length > 0 && day.hasSame(selectedDates[0], "day");
  const isEnd =
    selectedDates.length > 1 && day.hasSame(selectedDates[1], "day");
  const isInRange =
    selectedDates.length > 1 &&
    day > selectedDates[0] &&
    day < selectedDates[1];

  const dayNum = day.day;
  const ordinalSuffix = getOrdinalIndicator(dayNum);

  const formattedWithOrdinal = `${dayNum}${ordinalSuffix} of ${day.toFormat(MONTH_YEAR_FULL)}`;

  const isCurrent = day.hasSame(DateTime.now(), "day");

  const ariaLabel = isStart
    ? `${translateAria(["selectedStartDate"])} ${formattedWithOrdinal}`
    : isEnd
      ? `${translateAria(["selectedEndDate"])} ${formattedWithOrdinal}`
      : isCurrent
        ? `${translateAria(["currentSelectedDate"])} ${formattedWithOrdinal}`
        : `${formattedWithOrdinal}`;

  return (
    <MuiPickersDay
      className={muiClassNames ?? ""}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
      sx={classes.pickersDay}
      onClick={() => onDayClick(day)}
      aria-label={ariaLabel}
      {...other}
      aria-selected={isStart || isEnd || isInRange || isCurrent}
    />
  );
};

export default CalendarDateRangePickersDay;
