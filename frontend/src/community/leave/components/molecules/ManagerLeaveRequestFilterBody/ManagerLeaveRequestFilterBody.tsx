import {
  BasicFilterStructure,
  DateRangePicker,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";
import type { DateRange } from "react-day-picker";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { pascalCaseFormatter } from "~community/common/utils/commonUtil";
import { clampToCurrentYear } from "~community/common/utils/dateTimeUtils";
import { useManagerLeaveRequestFilters } from "~community/leave/hooks/useManagerLeaveRequestFilters";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";

const leaveStatusFilters: LeaveStatusTypes[] = [
  LeaveStatusTypes.PENDING,
  LeaveStatusTypes.APPROVED,
  LeaveStatusTypes.DENIED,
  LeaveStatusTypes.CANCELLED,
  LeaveStatusTypes.REVOKED
];

const toggleLeaveStatus = (
  values: LeaveStatusTypes[],
  value: LeaveStatusTypes
): LeaveStatusTypes[] =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

const toggleLeaveTypeId = (values: string[], value: string): string[] =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

interface Props {
  onClose: () => void;
  selectedDateRange?: DateRange;
  onDateRangeChange: (range?: DateRange) => void;
}

const ManagerLeaveRequestFilterBody: FC<Props> = ({
  onClose,
  selectedDateRange,
  onDateRangeChange
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveRequestFilters"
  );

  const {
    leaveTypeOptions,
    appliedStatus,
    appliedTypes,
    applyFilters,
    resetFilters
  } = useManagerLeaveRequestFilters();

  const [selectedStatus, setSelectedStatus] =
    useState<LeaveStatusTypes[]>(appliedStatus);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(appliedTypes);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    selectedDateRange
  );

  const isEmpty =
    selectedStatus.length === 0 &&
    selectedTypes.length === 0 &&
    !dateRange?.from &&
    !dateRange?.to;

  const handleApply = () => {
    applyFilters({ status: selectedStatus, types: selectedTypes });
    onDateRangeChange(dateRange);
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    onDateRangeChange(undefined);
    onClose();
  };

  return (
    <BasicFilterStructure
      title={translateText(["filterTitle"])}
      resetButtonProps={{
        onClick: handleReset,
        disabled: isEmpty,
        children: translateText(["resetButtonText"])
      }}
      applyButtonProps={{
        onClick: handleApply,
        children: translateText(["applyButtonText"]),
        "aria-label": translateText(["applyButtonText"])
      }}
    >
      <div className="flex flex-col gap-2">
        <p className="subtitle1">{translateText(["dateTitle"])}</p>
        <DateRangePicker
          value={dateRange}
          onChange={(range) => setDateRange(clampToCurrentYear(range))}
        />
      </div>
      <SelectableItemList
        title={translateText(["leaveStatusTitle"])}
        items={leaveStatusFilters.map((leaveStatus) => ({
          label: pascalCaseFormatter(leaveStatus),
          value: leaveStatus
        }))}
        selectedValues={selectedStatus}
        onChipClick={(leaveStatus) =>
          setSelectedStatus((previous) =>
            toggleLeaveStatus(previous, leaveStatus)
          )
        }
      />
      <SelectableItemList
        title={translateText(["leaveTypeTitle"])}
        items={leaveTypeOptions.map(({ id, name }) => ({
          label: name,
          value: id
        }))}
        selectedValues={selectedTypes}
        onChipClick={(leaveTypeId) =>
          setSelectedTypes((previous) =>
            toggleLeaveTypeId(previous, leaveTypeId)
          )
        }
        className="max-h-full"
      />
    </BasicFilterStructure>
  );
};

export default ManagerLeaveRequestFilterBody;
