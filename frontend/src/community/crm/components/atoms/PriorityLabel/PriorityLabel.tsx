import { PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { getPriorityConfig } from "~community/crm/utils/priorityUtil";

interface PriorityLabelProps {
  priority?: CrmPriorityEnum;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  const translateAria = useTranslator("crmAria");

  const { icon, bgColor, key } = getPriorityConfig(priority);

  return (
    <PriorityIcon
      bgColor={bgColor}
      icon={icon}
      ariaLabel={translateAria(["activities", "row", `${key}Priority`])}
    />
  );
};

export default PriorityLabel;
