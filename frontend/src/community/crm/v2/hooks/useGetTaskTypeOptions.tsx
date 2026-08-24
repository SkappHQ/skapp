import { useMemo } from "react";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskTypeEntity } from "~community/crm/v2/types/CrmCommonTypes";

/**
 * Task types are part of the CRM lookup set that is loaded into the store once
 * per session, so this just reads the store record rather than fetching its own
 * copy.
 */
const useGetTaskTypeOptions = (translateText: TranslatorFunctionType) => {
  const taskTypes = useCrmStoreV2((state) => state.taskTypes);

  const options = useMemo(
    () =>
      Object.values(taskTypes)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((taskType) => ({
          id: taskType.id.toString(),
          label: translateText(["taskTypes", taskType.name.toLowerCase()]),
          value: taskType.id.toString()
        })),
    [translateText, taskTypes]
  );

  const getCategoryById = (id: number | null): CrmTaskTypeEntity | null =>
    id === null ? null : (taskTypes[id] ?? null);

  return { options, getCategoryById };
};

export default useGetTaskTypeOptions;
