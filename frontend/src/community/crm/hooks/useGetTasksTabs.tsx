import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SALES_REP_RESTRICTED_TASK_TABS } from "~community/crm/constants/taskConstants";
import { CrmTaskTabEnum } from "~community/crm/enums/common";
import { CrmTaskTab } from "~community/crm/types/TaskTabTypes";

export const useGetTasksTabs = (): CrmTaskTab[] => {
  const translateText = useTranslator("crmModule", "tasks", "tabs");
  const { isCrmSalesManager } = useSessionData();

  const allTabs: CrmTaskTab[] = [
    {
      id: CrmTaskTabEnum.MY_TASKS,
      label: translateText(["myTasks"])
    },
    {
      id: CrmTaskTabEnum.TEAM_TASKS,
      label: translateText(["teamTasks"])
    },
    {
      id: CrmTaskTabEnum.COMPLETED_TASKS,
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
