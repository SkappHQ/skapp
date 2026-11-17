import { PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { getPriorityConfig } from "~community/crm/utils/priorityUtil";

interface PriorityLabelProps {
  priority?: CrmPriorityEnum;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  const translateText = useTranslator("crmModule");

  const { icon, bgColor, key } = getPriorityConfig(priority);

  return (
    <PriorityIcon
      bgColor={bgColor}
      icon={icon}
      ariaLabel={translateText(["common", "priorityOptions", key])}
    />
  );
};

export default PriorityLabel;
