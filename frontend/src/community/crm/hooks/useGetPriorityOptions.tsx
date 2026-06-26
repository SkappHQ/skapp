import { Label } from "@rootcodelabs/skapp-ui";
import { createElement, useMemo } from "react";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { PRIORITY_OPTIONS } from "~community/crm/constants/taskConstants";

const useGetPriorityOptions = (translateText: TranslatorFunctionType) => {
  return useMemo(
    () =>
      PRIORITY_OPTIONS.map((option) => ({
        id: option.key,
        label: (
          <Label backgroundColor={option.backgroundColor} className="py-2 px-3">
            {createElement(option.IconComponent)}
            <span className={`body3 ${option.textColor}`}>
              {translateText(["priorityOptions", option.key])}
            </span>
          </Label>
        ),
        value: option.value
      })),
    [translateText]
  );
};

export default useGetPriorityOptions;
