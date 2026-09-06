import { ReactElement, createElement } from "react";

import { PRIORITY_OPTIONS } from "~community/crm/v2/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";

export const getPriorityConfig = (
  priority?: CrmPriorityEnum
): { key: string; icon: ReactElement; bgColor: string; textColor: string } => {
  const option = PRIORITY_OPTIONS.find(
    (o) => o.value === (priority ?? CrmPriorityEnum.LOW)
  )!;
  return {
    key: option.key,
    icon: createElement(option.IconComponent),
    bgColor: option.backgroundColor,
    textColor: option.textColor
  };
};
