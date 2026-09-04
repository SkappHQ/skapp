import { PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";

interface PriorityLabelProps {
  priority?: CrmPriorityEnum;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  const priorityConfig = getPriorityConfig(priority);

  if (priorityConfig === undefined) {
    return null;
  }

  return (
    <PriorityIcon bgColor={priorityConfig.bgColor} icon={priorityConfig.icon} />
  );
};

export default PriorityLabel;
