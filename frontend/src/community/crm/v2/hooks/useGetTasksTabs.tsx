import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SALES_REP_RESTRICTED_TASK_TABS } from "~community/crm/v2/constants/taskConstants";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";
import { CrmTaskTab } from "~community/crm/v2/types/CrmTypes";

export const useGetTasksTabs = (): CrmTaskTab[] => {
  const translateText = useTranslator("crmModuleV2");
  const { isCrmSalesManager } = useSessionData();

  const allTabs: CrmTaskTab[] = [
    {
      id: CrmTaskTabEnum.MY_TASKS,
      label: translateText(["tasks", "tabs", "myTasks"])
    },
    {
      id: CrmTaskTabEnum.ALL_TASKS,
      label: translateText(["tasks", "tabs", "allTasks"])
    },
    {
      id: CrmTaskTabEnum.COMPLETED_TASKS,
      label: translateText(["tasks", "tabs", "completedTasks"])
    }
  ];

  if (!isCrmSalesManager) {
    return allTabs.filter(
      (tab) => !SALES_REP_RESTRICTED_TASK_TABS.includes(tab.id)
    );
  }

  return allTabs;
};
