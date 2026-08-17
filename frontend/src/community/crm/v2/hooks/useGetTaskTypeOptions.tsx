import { useEffect, useMemo } from "react";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useGetTaskTypes } from "~community/crm/v2/api/TaskApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskTypeEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { toTaskTypesRecord } from "~community/crm/v2/utils/crmEntityUtils";

/**
 * Task types are a complete lookup set, so they are fetched once and kept in
 * the store. `isTaskTypesInitialized` is what makes that true - it disables
 * the query once the first fetch lands, so remounting this hook from the
 * tasks list, the add-task form, or the edit-task form never re-fetches.
 * Everything that needs task types reads the same store record rather than
 * holding its own copy.
 */
const useGetTaskTypeOptions = (translateText: TranslatorFunctionType) => {
  const taskTypes = useCrmStoreV2((state) => state.taskTypes);
  const isTaskTypesInitialized = useCrmStoreV2(
    (state) => state.isTaskTypesInitialized
  );

  const { data } = useGetTaskTypes(!isTaskTypesInitialized);

  useEffect(() => {
    if (isTaskTypesInitialized || !data?.taskTypes) return;

    const { setTaskTypes, setIsTaskTypesInitialized } =
      useCrmStoreV2.getState();
    setTaskTypes(toTaskTypesRecord(data.taskTypes));
    setIsTaskTypesInitialized(true);
  }, [data, isTaskTypesInitialized]);

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
