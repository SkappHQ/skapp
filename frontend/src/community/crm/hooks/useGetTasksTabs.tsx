import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskTab } from "~community/crm/types/TaskTabTypes";

export const useGetTasksTabs = (): CrmTaskTab[] => {
  const translateText = useTranslator("crmModule", "tasks", "tabs");

  return [
    {
      id: "my-tasks",
      label: translateText(["myTasks"]),
      component: <></>
    },
    {
      id: "team-tasks",
      label: translateText(["teamTasks"]),
      component: <></>
    },
    {
      id: "completed-tasks",
      label: translateText(["completedTasks"]),
      component: <></>
    }
  ];
};
