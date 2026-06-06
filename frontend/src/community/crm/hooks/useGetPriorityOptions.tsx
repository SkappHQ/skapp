import { DropdownOption, Label } from "@rootcodelabs/skapp-ui";
import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { priorityOptions } from "~community/crm/constants/taskConstants";

const useGetPriorityOptions = (): DropdownOption[] => {
  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  return useMemo(
    () =>
      priorityOptions.map((option) => ({
        id: option.key,
        label: (
          <Label
            key={option.key}
            backgroundColor={option.backgroundColor}
            textColor={option.textColor}
          >
            {translateText(["priorityOptions", option.key])}
          </Label>
        ),
        value: option.value
      })),
    [translateText]
  );
};

export default useGetPriorityOptions;
