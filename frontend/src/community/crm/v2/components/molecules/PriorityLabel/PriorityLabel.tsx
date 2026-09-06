import { Label, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";

interface PriorityLabelProps {
  priority?: CrmPriorityEnum;
  label?: string;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority, label }) => {
  const { icon, bgColor, textColor } = getPriorityConfig(priority);

  if (!label) {
    return <PriorityIcon bgColor={bgColor} icon={icon} />;
  }

  return (
    <Label backgroundColor={bgColor} className="py-2 px-3">
      {icon}
      <span className={`body3 ${textColor}`}>{label}</span>
    </Label>
  );
};

export default PriorityLabel;
