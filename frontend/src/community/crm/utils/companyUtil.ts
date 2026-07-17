import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { countOpenTasks } from "~community/crm/utils/crmUtil";

import { CrmCompany, MetricItem } from "../types/CommonTypes";

export const updateCompanyTaskCompletion = (
  companies: CrmCompany[],
  companyId: number,
  taskId: number,
  isCompleted: boolean
): CrmCompany[] =>
  companies.map((company) => {
    if (company.id !== companyId || !company.tasks) return company;

    const updatedTasks = company.tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted } : task
    );

    return {
      ...company,
      tasks: updatedTasks,
      openTasksCount: countOpenTasks(updatedTasks)
    };
  });

export const mapCompanyToMetricItems = (
  company: CrmCompany,
  translateText: TranslatorFunctionType
): MetricItem[] => {
  return [
    {
      id: "accountValue",
      title: translateText(["metrics", "accountValue"]),
      amount: String(company.accountValue ?? 0),
      isCurrency: true
    },
    {
      id: "openDeals",
      title: translateText(["metrics", "openDeals"]),
      amount: String(company.openDeals ?? 0)
    },
    {
      id: "closedDeals",
      title: translateText(["metrics", "closedDeals"]),
      amount: String(company.closedDeals ?? 0)
    }
  ];
};
