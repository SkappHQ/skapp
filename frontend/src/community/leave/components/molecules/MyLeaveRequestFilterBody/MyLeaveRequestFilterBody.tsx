import {
  BasicFilterStructure,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { pascalCaseFormatter } from "~community/common/utils/commonUtil";
import { useMyLeaveRequestFilterState } from "~community/leave/hooks/useMyLeaveRequestFilterState";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";

const leaveStatusFilters: string[] = [
  LeaveStatusTypes.PENDING,
  LeaveStatusTypes.APPROVED,
  LeaveStatusTypes.DENIED,
  LeaveStatusTypes.REVOKED,
  LeaveStatusTypes.CANCELLED
];

const toggleValue = (values: string[], value: string): string[] =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

interface Props {
  close: () => void;
}

const MyLeaveRequestFilterBody: FC<Props> = ({ close }) => {
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
  } = useMyLeaveRequestFilterState();

  const [selectedStatus, setSelectedStatus] = useState<string[]>(appliedStatus);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(appliedTypes);

  const isEmpty = selectedStatus.length === 0 && selectedTypes.length === 0;

  const handleApply = () => {
    applyFilters({ status: selectedStatus, types: selectedTypes });
    close();
  };

  const handleReset = () => {
    resetFilters();
    close();
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
            setSelectedStatus((previous) => toggleValue(previous, leaveStatus))
          }
        />
      </section>
      <section aria-label={translateAria(["typeFilterSection"])}>
        <SelectableItemList
          title={translateText(["filterButtonType"])}
          items={leaveTypeOptions.map(({ id, name }) => ({
            label: name,
            value: id
          }))}
          selectedValues={selectedTypes}
          onChipClick={(leaveTypeId) =>
            setSelectedTypes((previous) => toggleValue(previous, leaveTypeId))
          }
          className="max-h-full"
        />
      </section>
    </BasicFilterStructure>
  );
};

export default MyLeaveRequestFilterBody;
