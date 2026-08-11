import {
  BasicFilterStructure,
  DateRangePicker,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";
import type { DateRange } from "react-day-picker";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  pascalCaseFormatter,
  toggleFilterValue
} from "~community/common/utils/commonUtil";
import { clampToCurrentYear } from "~community/common/utils/dateTimeUtils";
import { useGetPolicyLeaveTypes } from "~community/leave/api/PolicyLeaveTypeApi";
import { UNPAGINATED_SIZE } from "~community/leave/constants/policyLeaveTypeConstants";
import { usePolicyLeaveReviewStore } from "~community/leave/store/policyLeaveReviewStore";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { policyLeaveStatusFilters } from "~community/leave/utils/policyLeave/policyLeaveUtils";

interface Props {
  onClose: () => void;
  selectedDateRange?: DateRange;
  onDateRangeChange: (range?: DateRange) => void;
}

const PolicyManagerLeaveRequestFilterBody: FC<Props> = ({
  onClose,
  selectedDateRange,
  onDateRangeChange
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveRequestFilters"
  );

  const requestParams = usePolicyLeaveReviewStore(
    (state) => state.requestParams
  );
  const setRequestFilters = usePolicyLeaveReviewStore(
    (state) => state.setRequestFilters
  );
  const resetRequestFilters = usePolicyLeaveReviewStore(
    (state) => state.resetRequestFilters
  );

  const { data: leaveTypes } = useGetPolicyLeaveTypes({
    isActive: true,
    page: 0,
    size: UNPAGINATED_SIZE
  });

  const [selectedStatus, setSelectedStatus] = useState<
    PolicyLeaveRequestStatus[]
  >(requestParams.status);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() =>
    requestParams.leaveTypeId.map(String)
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    selectedDateRange
  );

  const isEmpty =
    selectedStatus.length === 0 &&
    selectedTypes.length === 0 &&
    !dateRange?.from &&
    !dateRange?.to;

  const handleApply = () => {
    setRequestFilters({
      status: selectedStatus,
      leaveTypeId: selectedTypes.map(Number)
    });
    onDateRangeChange(dateRange);
    onClose();
  };

  const handleReset = () => {
    setSelectedStatus([]);
    setSelectedTypes([]);
    setDateRange(undefined);
    resetRequestFilters();
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
        items={policyLeaveStatusFilters.map((leaveStatus) => ({
          label: pascalCaseFormatter(leaveStatus),
          value: leaveStatus
        }))}
        selectedValues={selectedStatus}
        onChipClick={(leaveStatus) =>
          setSelectedStatus((previous) =>
            toggleFilterValue(previous, leaveStatus)
          )
        }
      />
      <SelectableItemList
        title={translateText(["leaveTypeTitle"])}
        items={(leaveTypes?.items ?? []).map((leaveType) => ({
          label: leaveType.name,
          value: String(leaveType.id)
        }))}
        selectedValues={selectedTypes}
        onChipClick={(leaveTypeId) =>
          setSelectedTypes((previous) =>
            toggleFilterValue(previous, leaveTypeId)
          )
        }
        className="max-h-full"
      />
    </BasicFilterStructure>
  );
};

export default PolicyManagerLeaveRequestFilterBody;
