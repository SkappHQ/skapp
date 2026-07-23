import {
  BasicFilterStructure,
  DateRangePicker,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";
import type { DateRange } from "react-day-picker";

import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  convertDateToFormat,
  convertYYYYMMDDToDateTime,
  getFirstDateOfYear
} from "~community/common/utils/dateTimeUtils";

const toDateRange = (dates: string[]): DateRange | undefined => {
  const [from, to] = dates ?? [];
  if (!from && !to) return undefined;
  return {
    from: from ? convertYYYYMMDDToDateTime(from).toJSDate() : undefined,
    to: to ? convertYYYYMMDDToDateTime(to).toJSDate() : undefined
  };
};

/** `DateRange` → store `["YYYY-MM-DD", "YYYY-MM-DD"]` (empty strings when unset). */
const fromDateRange = (range?: DateRange): string[] => [
  range?.from ? convertDateToFormat(range.from, DATE_FORMAT) : "",
  range?.to ? convertDateToFormat(range.to, DATE_FORMAT) : ""
];

/**
 * skapp-ui's DateRangePicker has no minDate prop, so the calendar itself can't
 * grey out prior years. Clamp here instead to preserve the current-year-only
 * constraint the legacy filter enforced via minDate.
 */
const clampToCurrentYear = (range?: DateRange): DateRange | undefined => {
  if (!range) return range;
  const yearStart = getFirstDateOfYear(new Date().getFullYear()).toJSDate();
  const clamp = (date?: Date) => (date && date < yearStart ? yearStart : date);
  return { from: clamp(range.from), to: clamp(range.to) };
};

interface Props {
  isManager?: boolean;
  close: () => void;
}

const TimesheetRequestFilterBody: FC<Props> = ({
  isManager = false,
  close
}) => {
  const translateText = useTranslator("attendanceModule", "timesheet");

  const {
    employeeTimesheetRequestsFilterValues,
    employeeTimesheetRequestsFilters,
    employeeTimesheetRequestSelectedDates,
    setEmployeeTimesheetRequestsFilters,
    setEmployeeTimesheetRequestSelectedDates,
    resetEmployeeTimesheetRequestParams,
    timesheetRequestsFilterValues,
    timesheetRequestsFilters,
    timesheetRequestSelectedDates,
    setTimesheetRequestsFilters,
    setTimesheetRequestSelectedDates,
    resetTimesheetRequestParams
  } = useAttendanceStore((state) => state);

  const filterValues = isManager
    ? timesheetRequestsFilterValues
    : employeeTimesheetRequestsFilterValues;
  const appliedStatus = isManager
    ? timesheetRequestsFilters.status
    : employeeTimesheetRequestsFilters.status;
  const appliedDates = isManager
    ? timesheetRequestSelectedDates
    : employeeTimesheetRequestSelectedDates;
  const setFilters = isManager
    ? setTimesheetRequestsFilters
    : setEmployeeTimesheetRequestsFilters;
  const setDates = isManager
    ? setTimesheetRequestSelectedDates
    : setEmployeeTimesheetRequestSelectedDates;
  const resetParams = isManager
    ? resetTimesheetRequestParams
    : resetEmployeeTimesheetRequestParams;

  const [tempStatus, setTempStatus] = useState<string[]>(appliedStatus);
  const [tempDates, setTempDates] = useState<DateRange | undefined>(
    toDateRange(appliedDates)
  );

  const isEmpty = tempStatus.length === 0 && !tempDates?.from && !tempDates?.to;

  const toggleStatus = (value: string) =>
    setTempStatus((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );

  const handleApply = () => {
    setFilters({ status: tempStatus });
    setDates(fromDateRange(tempDates));
    close();
  };

  const handleReset = () => {
    resetParams();
    setDates(["", ""]);
    close();
  };

  return (
    <BasicFilterStructure
      title={translateText(["filterTitle"])}
      resetButtonProps={{
        onClick: handleReset,
        disabled: isEmpty,
        children: translateText(["resetBtnTxt"])
      }}
      applyButtonProps={{
        onClick: handleApply,
        children: translateText(["applyBtnTxt"]),
        "aria-label": translateText(["applyBtnTxt"])
      }}
    >
      <div className="flex flex-col gap-2">
        <p className="subtitle1">{translateText(["dateRangeLabel"])}</p>
        <DateRangePicker
          value={tempDates}
          onChange={(range) => setTempDates(clampToCurrentYear(range))}
        />
      </div>
      <SelectableItemList
        title={translateText(["statusFilterTitle"])}
        items={filterValues.status.map((status) => ({
          label: status.label,
          value: status.value
        }))}
        selectedValues={tempStatus}
        onChipClick={(value) => toggleStatus(value)}
      />
    </BasicFilterStructure>
  );
};

export default TimesheetRequestFilterBody;
