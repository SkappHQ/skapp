import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { priorityOptions } from "~community/crm/constants/taskConstants";

const useGetPriorityOptions = (initial: string, ...keys: string[]) => {
  const translateText = useTranslator(initial, ...keys);

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
