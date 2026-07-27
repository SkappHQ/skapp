import {
  BasicFilterStructure,
  DateRangePicker,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";
import type { DateRange } from "react-day-picker";

import { useTimesheetRequestFilterState } from "~community/attendance/hooks/useTimesheetRequestFilterState";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  clampToCurrentYear,
  convertDateRangeArrayToDateRange,
  convertDateRangeToDateRangeArray
} from "~community/common/utils/dateTimeUtils";

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
    filterValues,
    appliedStatus,
    appliedDates,
    setFilters,
    setDates,
    resetParams
  } = useTimesheetRequestFilterState(isManager, false);

  const [selectedStatus, setSelectedStatus] = useState<string[]>(appliedStatus);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(
    convertDateRangeArrayToDateRange(appliedDates)
  );

  const isEmpty = selectedStatus.length === 0 && !selectedDateRange?.from && !selectedDateRange?.to;

  const toggleStatus = (value: string) =>
    setSelectedStatus((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );

  const handleApply = () => {
    setFilters({ status: selectedStatus });
    setDates(convertDateRangeToDateRangeArray(selectedDateRange));
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
          value={selectedDateRange}
          onChange={(range) => setSelectedDateRange(clampToCurrentYear(range))}
        />
      </div>
      <SelectableItemList
        title={translateText(["statusFilterTitle"])}
        items={filterValues.status.map((status) => ({
          label: status.label,
          value: status.value
        }))}
        selectedValues={selectedStatus}
        onChipClick={(value) => toggleStatus(value)}
      />
    </BasicFilterStructure>
  );
};

export default TimesheetRequestFilterBody;
