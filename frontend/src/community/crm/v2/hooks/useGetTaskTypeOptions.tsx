import { useMemo } from "react";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";

const useGetTaskTypeOptions = (translateText: TranslatorFunctionType) => {
  const taskTypes = useCrmStoreV2((store) => store.taskTypes);

  return useMemo(
    () =>
      Object.values(taskTypes)
        .sort((first, second) => first.orderIndex - second.orderIndex)
        .map((taskType) => ({
          id: taskType.id.toString(),
          label: translateText(["taskTypes", taskType.name.toLowerCase()]),
          value: taskType.id.toString()
        })),
    [translateText, taskTypes]
  );
};

export default useGetTaskTypeOptions;
