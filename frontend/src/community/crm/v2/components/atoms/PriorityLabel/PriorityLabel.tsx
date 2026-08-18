import { PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum as CrmPriorityEnumV1 } from "~community/crm/enums/common";
import { getPriorityConfig } from "~community/crm/utils/taskUtil";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
}

// v1 and v2 CrmPriorityEnum share identical string values (LOW/MEDIUM/HIGH); the
// only difference is the nominal type. Bridge it here so the reused icon/colour
// config stays a single source of truth.
const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  const { icon, bgColor } = getPriorityConfig(
    priority as unknown as CrmPriorityEnumV1
  );

  return <PriorityIcon bgColor={bgColor} icon={icon} />;
};

export default PriorityLabel;
