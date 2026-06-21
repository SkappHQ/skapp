import { PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC, createElement } from "react";

import { PRIORITY_OPTIONS } from "~community/crm/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  const config = PRIORITY_OPTIONS.find((option) => option.value === priority);
  if (!config) return null;

  return (
    <PriorityIcon
      bgColor={config.backgroundColor}
      icon={createElement(config.IconComponent)}
    />
  );
};

export default PriorityLabel;
