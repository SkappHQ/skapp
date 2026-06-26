import { useMemo } from "react";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmTaskCategory } from "~community/crm/types/CommonTypes";

import { useGetTaskTypes } from "../api/TaskApi";

const useGetTaskTypeOptions = (translateText: TranslatorFunctionType) => {
  const { data: taskCategories } = useGetTaskTypes();

  const options = useMemo(
    () =>
      (taskCategories?.taskTypes ?? []).map((category) => ({
        id: category.id.toString(),
        label: translateText(["taskTypes", category.name.toLowerCase()]),
        value: category.id.toString()
      })),
    [translateText, taskCategories]
  );

  const getCategoryById = (id: number | null): CrmTaskCategory | null =>
    taskCategories?.taskTypes?.find((c) => c.id === id) ?? null;

  return { options, getCategoryById };
};

export default useGetTaskTypeOptions;
