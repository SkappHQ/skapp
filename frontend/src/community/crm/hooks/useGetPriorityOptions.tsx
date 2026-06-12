import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { priorityOptions } from "~community/crm/constants/taskConstants";

const useGetPriorityOptions = () => {
  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  return useMemo(
    () =>
      priorityOptions.map((option) => ({
        id: option.key,
        label: (
          <PriorityLabel
            priority={option.value}
            label={translateText(["priorityOptions", option.key])}
          />
        ),
        value: option.value
      })),
    [translateText]
  );
};

export default useGetPriorityOptions;
