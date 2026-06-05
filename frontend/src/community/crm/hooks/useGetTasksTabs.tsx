import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskTab } from "~community/crm/types/TaskTabTypes";

export const useGetTasksTabs = (): CrmTaskTab[] => {
  const translateText = useTranslator("crmModule", "tasks", "tabs");

  return useMemo(
    () => [
      {
        id: "my-tasks",
        label: translateText(["myTasks"]),
        component: <></>,
        position: 1
      },
      {
        id: "team-tasks",
        label: translateText(["teamTasks"]),
        component: <></>,
        position: 2
      },
      {
        id: "completed-tasks",
        label: translateText(["completedTasks"]),
        component: <></>,
        position: 3
      }
    ],
    [translateText]
  );
};
