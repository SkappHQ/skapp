import { DropdownOption } from "@rootcodelabs/skapp-ui";
import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskCategory } from "~community/crm/types/CommonTypes";

// TODO: Replace with API-fetched categories once backend is implemented
const STATIC_TASK_CATEGORIES: CrmTaskCategory[] = [
  { id: 1, name: "Call", orderIndex: 0 },
  { id: 2, name: "Email", orderIndex: 1 },
  { id: 3, name: "Meeting", orderIndex: 2 },
  { id: 4, name: "Other", orderIndex: 3 }
];

const useGetTaskTypeOptions = () => {
  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const options: DropdownOption[] = useMemo(
    () =>
      STATIC_TASK_CATEGORIES.map((category) => ({
        id: category.id.toString(),
        label: translateText(["taskTypes", category.name.toLowerCase()]),
        value: category.id.toString()
      })),
    [translateText]
  );

  const getCategoryById = (id: number): CrmTaskCategory | undefined =>
    STATIC_TASK_CATEGORIES.find((c) => c.id === id);

  return { options, getCategoryById };
};

export default useGetTaskTypeOptions;
