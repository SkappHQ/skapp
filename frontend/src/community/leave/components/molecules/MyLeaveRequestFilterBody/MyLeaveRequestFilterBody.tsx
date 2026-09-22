import {
  BasicFilterStructure,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  pascalCaseFormatter,
  toggleFilterValue
} from "~community/common/utils/commonUtil";
import { useMyLeaveRequestFilters } from "~community/leave/hooks/useMyLeaveRequestFilters";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";
import { leaveStatusFilters } from "~community/leave/utils/leaveRequest/leaveRequestFilterUtils";

interface Props {
  onClose: () => void;
}

const MyLeaveRequestFilterBody: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveRequests"
  );
  const translateFilterText = useTranslator("commonComponents", "filterButton");

  const {
    leaveTypeOptions,
    appliedStatus,
    appliedTypes,
    applyFilters,
    resetFilters
  } = useMyLeaveRequestFilters();

  const [selectedStatus, setSelectedStatus] =
    useState<LeaveStatusTypes[]>(appliedStatus);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(appliedTypes);

  const isEmpty = selectedStatus.length === 0 && selectedTypes.length === 0;

  const handleApply = () => {
    applyFilters({ status: selectedStatus, leaveTypesIds: selectedTypes });
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    onClose();
  };

  return (
    <BasicFilterStructure
      title={translateFilterText(["title"])}
      resetButtonProps={{
        onClick: handleReset,
        disabled: isEmpty,
        children: translateFilterText(["resetBtn"])
      }}
      applyButtonProps={{
        onClick: handleApply,
        children: translateFilterText(["applyBtn"]),
        "aria-label": translateFilterText(["applyBtn"])
      }}
    >
      <section aria-label={translateAria(["statusFilterSection"])}>
        <SelectableItemList
          title={translateText(["filterButtonStatus"])}
          items={leaveStatusFilters.map((leaveStatus) => ({
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
      </section>
      <section aria-label={translateAria(["typeFilterSection"])}>
        <SelectableItemList
          title={translateText(["filterButtonType"])}
          items={leaveTypeOptions.map((option) => ({
            label: option.name,
            value: option.id
          }))}
          selectedValues={selectedTypes}
          onChipClick={(leaveTypeId) =>
            setSelectedTypes((previous) =>
              toggleFilterValue(previous, leaveTypeId)
            )
          }
          className="max-h-full"
        />
      </section>
    </BasicFilterStructure>
  );
};

export default MyLeaveRequestFilterBody;
