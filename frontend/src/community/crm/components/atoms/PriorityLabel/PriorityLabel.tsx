import { PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";
import { getPriorityConfig } from "~community/crm/utils/taskUtil";

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  const { icon, bgColor } = getPriorityConfig(priority);

  return <PriorityIcon bgColor={bgColor} icon={icon} />;
};

export default PriorityLabel;
