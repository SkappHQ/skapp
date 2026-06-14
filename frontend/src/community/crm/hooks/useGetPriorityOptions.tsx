import { useMemo } from "react";

import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { priorityOptions } from "~community/crm/constants/taskConstants";

const useGetPriorityOptions = () => {
  return useMemo(
    () =>
      priorityOptions.map((option) => ({
        id: option.key,
        label: <PriorityLabel priority={option.value} />,
        value: option.value
      })),
    []
  );
};

export default useGetPriorityOptions;
