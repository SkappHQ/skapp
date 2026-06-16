import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  SALES_REP_RESTRICTED_TASK_TABS,
  TASK_TAB_IDS
} from "~community/crm/constants/taskConstants";
import { CrmTaskTab } from "~community/crm/types/TaskTabTypes";

export const useGetTasksTabs = (): CrmTaskTab[] => {
  const translateText = useTranslator("crmModule", "tasks", "tabs");
  const { isCrmSalesManager } =
    useSessionData();

  const allTabs: CrmTaskTab[] = [
    {
      id: TASK_TAB_IDS.MY_TASKS,
      label: translateText(["myTasks"])
    },
    {
      id: TASK_TAB_IDS.TEAM_TASKS,
      label: translateText(["teamTasks"])
    },
    {
      id: TASK_TAB_IDS.COMPLETED_TASKS,
      label: translateText(["completedTasks"])
    }
  ];

  if (!(isCrmSalesManager ?? false)) {
    return allTabs.filter(
      (tab) => !SALES_REP_RESTRICTED_TASK_TABS.includes(tab.id)
    );
  }

  return allTabs;
};
