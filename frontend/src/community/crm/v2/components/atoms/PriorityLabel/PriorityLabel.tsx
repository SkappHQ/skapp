import { Label, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";

interface PriorityLabelProps {
  priority?: CrmPriorityEnum;
  showLabel?: boolean;
}

const PriorityLabel: FC<PriorityLabelProps> = ({
  priority,
  showLabel = false
}) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { key, icon, bgColor, textColor } = getPriorityConfig(priority);

  if (!showLabel) {
    return <PriorityIcon bgColor={bgColor} icon={icon} />;
  }

  return (
    <Label backgroundColor={bgColor} className="py-2 px-3">
      {icon}
      <span className={`body3 ${textColor}`}>
        {translateText(["priorityOptions", key])}
      </span>
    </Label>
  );
};

export default PriorityLabel;
