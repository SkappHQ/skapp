import { useMemo } from "react";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { PRIORITY_OPTIONS } from "~community/crm/constants/taskConstants";

const useGetPriorityOptions = (translateText: TranslatorFunctionType) => {
  return useMemo(
    () =>
      PRIORITY_OPTIONS.map((option) => ({
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
