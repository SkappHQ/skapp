import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";

export interface CrmTaskTab {
  id: CrmTaskTabEnum;
  label: string;
  position?: number;
}

const SALES_REP_RESTRICTED_TASK_TABS: CrmTaskTabEnum[] = [
  CrmTaskTabEnum.ALL_TASKS
];

export const useGetTasksTabs = (): CrmTaskTab[] => {
  const translateText = useTranslator("crmModule", "tasks", "tabs");
  const { isCrmSalesManager } = useSessionData();

  const allTabs: CrmTaskTab[] = [
    {
      id: CrmTaskTabEnum.MY_TASKS,
      label: translateText(["myTasks"])
    },
    {
      id: CrmTaskTabEnum.ALL_TASKS,
      label: translateText(["allTasks"])
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
