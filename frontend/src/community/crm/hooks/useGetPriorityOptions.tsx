import { Label } from "@rootcodelabs/skapp-ui";
import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { PRIORITY_OPTIONS } from "~community/crm/constants/taskConstants";

const useGetPriorityOptions = () => {
  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  return useMemo(
    () =>
      PRIORITY_OPTIONS.map((option) => ({
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
