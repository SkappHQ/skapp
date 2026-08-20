import { PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  const { icon, bgColor } = getPriorityConfig(priority);

  return <PriorityIcon bgColor={bgColor} icon={icon} />;
};

export default PriorityLabel;
