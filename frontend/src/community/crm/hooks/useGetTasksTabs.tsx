import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskTab } from "~community/crm/types/TaskTabTypes";

export const useGetTasksTabs = (): CrmTaskTab[] => {
  const translateText = useTranslator("crmModule", "tasks", "tabs");

  return [
    {
      id: "my-tasks",
      label: translateText(["myTasks"])
    },
    {
      id: "team-tasks",
      label: translateText(["teamTasks"])
    },
    {
      id: "completed-tasks",
      label: translateText(["completedTasks"])
    }
  ];
};
