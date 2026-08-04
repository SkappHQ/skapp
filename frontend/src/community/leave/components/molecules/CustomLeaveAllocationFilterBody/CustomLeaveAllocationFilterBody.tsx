import {
  BasicFilterStructure,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { toggleFilterValue } from "~community/common/utils/commonUtil";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";

interface Props {
  appliedLeaveTypeIds: string[];
  onApply: (leaveTypeIds: string[]) => void;
  onReset: () => void;
  onClose: () => void;
}

const CustomLeaveAllocationFilterBody: FC<Props> = ({
  appliedLeaveTypeIds,
  onApply,
  onReset,
  onClose
}) => {
  const translateText = useTranslator("leaveModule", "customLeave");
  const translateFilterText = useTranslator("commonComponents", "filterButton");

  const { data: leaveTypes } = useGetLeaveTypes();

  const [selectedLeaveTypes, setSelectedLeaveTypes] =
    useState<string[]>(appliedLeaveTypeIds);

  const leaveTypeOptions = (leaveTypes ?? []).map((leaveType) => ({
    label: leaveType.name,
    value: leaveType.typeId.toString()
  }));

  const handleApply = () => {
    onApply(selectedLeaveTypes);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <BasicFilterStructure
      title={translateFilterText(["title"])}
      resetButtonProps={{
        onClick: handleReset,
        disabled: selectedLeaveTypes.length === 0,
        children: translateFilterText(["resetBtn"])
      }}
      applyButtonProps={{
        onClick: handleApply,
        children: translateFilterText(["applyBtn"]),
        "aria-label": translateFilterText(["applyBtn"])
      }}
    >
      <SelectableItemList
        title={translateText(["filterButtonTitle"])}
        items={leaveTypeOptions}
        selectedValues={selectedLeaveTypes}
        onChipClick={(leaveTypeId) =>
          setSelectedLeaveTypes((previous) =>
            toggleFilterValue(previous, leaveTypeId)
          )
        }
        className="max-h-full"
      />
    </BasicFilterStructure>
  );
};

export default CustomLeaveAllocationFilterBody;
