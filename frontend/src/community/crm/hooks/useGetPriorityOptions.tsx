import { useMemo } from "react";

import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { priorityOptions } from "~community/crm/constants/taskConstants";

type TranslateText = (
  suffixes: string[],
  interpolationValues?: Record<string, any>
) => string;

const useGetPriorityOptions = (translateText: TranslateText) => {
  return useMemo(
    () =>
      priorityOptions.map((option) => ({
        id: option.key,
        label: (
          <PriorityLabel
            priority={option.value}
            label={translateText([
              "priorityOptions",
              option.value.toLowerCase()
            ])}
          />
        ),
        value: option.value
      })),
    [translateText]
  );
};

export default useGetPriorityOptions;
