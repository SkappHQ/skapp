import { Label } from "@rootcodelabs/skapp-ui";
import { createElement } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { PRIORITY_OPTIONS } from "~community/crm/v2/constants/taskConstants";
import { CrmPriorityOption } from "~community/crm/v2/types/CrmTypes";

export const useGetPriorityOptions = (): CrmPriorityOption[] => {
  const translateText = useTranslator("crmModule", "common", "priorityOptions");

  return PRIORITY_OPTIONS.map((option) => ({
    id: option.key,
    value: option.value,
    label: (
      <Label backgroundColor={option.backgroundColor} className="py-2 px-3">
        {createElement(option.IconComponent)}
        <span className={`body3 ${option.textColor}`}>
          {translateText([option.key])}
        </span>
      </Label>
    )
  }));
};
