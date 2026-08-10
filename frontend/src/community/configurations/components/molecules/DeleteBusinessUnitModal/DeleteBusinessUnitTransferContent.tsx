import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { BUSINESS_UNIT_TRANSFER_UNASSIGN_VALUE } from "~community/common/constants/commonConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { BusinessUnit } from "~community/common/types/BusinessUnitTypes";

interface Props {
  businessUnits: BusinessUnit[];
  currentBusinessUnitId: number;
  businessUnitName: string;
  assignedEmployeeCount: number;
  value: string;
  onChange: (value: string) => void;
}

const DeleteBusinessUnitTransferContent: FC<Props> = ({
  businessUnits,
  currentBusinessUnitId,
  businessUnitName,
  assignedEmployeeCount,
  value,
  onChange
}) => {
  const translateText = useTranslator("configurations", "businessUnit");

  const otherUnits = businessUnits.filter(
    (unit) => unit.businessUnitId !== currentBusinessUnitId
  );

  const transferOptions = [
    {
      id: BUSINESS_UNIT_TRANSFER_UNASSIGN_VALUE,
      label: translateText(["deleteModal", "unassignOption"]),
      value: BUSINESS_UNIT_TRANSFER_UNASSIGN_VALUE
    },
    ...otherUnits.map((unit) => ({
      id: String(unit.businessUnitId),
      label: unit.name,
      value: String(unit.businessUnitId)
    }))
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="body1">
        {translateText(["deleteModal", "assignedDescription"], {
          count: assignedEmployeeCount,
          name: businessUnitName
        })}
      </p>
      <Dropdown
        id="business-unit-transfer-target"
        label={translateText(["deleteModal", "transferToLabel"])}
        tooltipContent={translateText(["deleteModal", "transferTooltip"])}
        ariaLabelTooltipButton={translateText([
          "deleteModal",
          "transferTooltipAriaLabel"
        ])}
        options={transferOptions}
        value={value}
        onChange={(newValue) => onChange(newValue)}
        width="100%"
        className="rounded-lg"
      />
    </div>
  );
};

export default DeleteBusinessUnitTransferContent;
