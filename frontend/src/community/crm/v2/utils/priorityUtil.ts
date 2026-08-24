import { ReactElement, createElement } from "react";

import { PRIORITY_OPTIONS } from "~community/crm/v2/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";

export interface CrmPriorityConfig {
  icon: ReactElement;
  bgColor: string;
  textColor: string;
}

export const getPriorityConfig = (
  priority: CrmPriorityEnum | undefined
): CrmPriorityConfig | null => {
  const option = PRIORITY_OPTIONS.find((o) => o.value === priority);
  if (!option) return null;

  return {
    icon: createElement(option.IconComponent),
    bgColor: option.backgroundColor,
    textColor: option.textColor
  };
};
