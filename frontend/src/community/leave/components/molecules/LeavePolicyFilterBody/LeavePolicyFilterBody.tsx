import {
  BasicFilterStructure,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetPolicyLeaveTypes } from "~community/leave/api/PolicyLeaveTypeApi";
import { UNPAGINATED_SIZE } from "~community/leave/constants/policyLeaveTypeConstants";

interface Props {
  appliedLeaveTypeId: string;
  onApply: (leaveTypeId: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const LeavePolicyFilterBody: FC<Props> = ({
  appliedLeaveTypeId,
  onApply,
  onReset,
  onClose
}) => {
  const translateText = useTranslator("leaveModule", "leavePolicies");
  const translateFilterText = useTranslator("commonComponents", "filterButton");

  const { data: policyLeaveTypes } = useGetPolicyLeaveTypes({
    isActive: true,
    page: 0,
    size: UNPAGINATED_SIZE
  });

  const [selectedLeaveTypeId, setSelectedLeaveTypeId] =
    useState<string>(appliedLeaveTypeId);

  const leaveTypeOptions = (policyLeaveTypes?.items ?? []).map(
    (leaveType) => ({
      label: leaveType.name,
      value: String(leaveType.id)
    })
  );

  const handleChipClick = (leaveTypeId: string): void => {
    setSelectedLeaveTypeId((previous) =>
      previous === leaveTypeId ? "" : leaveTypeId
    );
  };

  const handleApply = (): void => {
    onApply(selectedLeaveTypeId);
    onClose();
  };

  const handleReset = (): void => {
    setSelectedLeaveTypeId("");
    onReset();
    onClose();
  };

  return (
    <BasicFilterStructure
      title={translateFilterText(["title"])}
      resetButtonProps={{
        onClick: handleReset,
        disabled: !selectedLeaveTypeId,
        children: translateFilterText(["resetBtn"])
      }}
      applyButtonProps={{
        onClick: handleApply,
        children: translateFilterText(["applyBtn"]),
        "aria-label": translateFilterText(["applyBtn"])
      }}
    >
      <SelectableItemList
        title={translateText(["leaveTypeFilterLabel"])}
        items={leaveTypeOptions}
        selectedValues={selectedLeaveTypeId ? [selectedLeaveTypeId] : []}
        onChipClick={handleChipClick}
        className="max-h-full"
      />
    </BasicFilterStructure>
  );
};

export default LeavePolicyFilterBody;
