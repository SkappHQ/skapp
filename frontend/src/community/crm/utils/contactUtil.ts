import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { CrmMetricLabelThemeEnum } from "~community/crm/enums/common";
import {
  CompanyLookup,
  CrmContact,
  MetricItem
} from "~community/crm/types/CommonTypes";
import { groupItemsByPriority } from "~community/crm/utils/crmUtil";

export const mergeContactUpdate = (
  contacts: CrmContact[],
  update: CrmContact
): CrmContact[] =>
  contacts.map((contact) =>
    contact.id === update.id ? { ...contact, ...update } : contact
  );

export const updateContactTaskCompletion = (
  contacts: CrmContact[],
  contactId: number,
  taskId: number,
  isCompleted: boolean
): CrmContact[] =>
  contacts.map((contact) => {
    if (contact.id !== contactId || !contact.tasks) return contact;

    const updatedTasks = contact.tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted } : task
    );

    return {
      ...contact,
      tasks: updatedTasks,
      openTasksCount: updatedTasks.filter((task) => !task.isCompleted).length
    };
  });

export const reconcileContacts = (
  existing: CrmContact[],
  incoming: CrmContact[]
): CrmContact[] =>
  incoming.map((item) => {
    const enriched = existing.find((contact) => contact.id === item.id);
    return enriched ? { ...item, ...enriched } : item;
  });

export interface CompanyDropdownItem extends SearchableDropdownItem {
  isPrioritized?: boolean;
}

export const toDropdownItem = (
  company: CompanyLookup
): SearchableDropdownItem => ({
  id: String(company.id),
  content: company.name
});

export const mergeAndPrioritizeCompanyDropdownItems = (
  lookupCompanies: CompanyLookup[] | undefined,
  domainCompanies: CompanyLookup[] | undefined
): CompanyDropdownItem[] => {
  const lookupItems = lookupCompanies?.map(toDropdownItem) ?? [];
  const domainItems = domainCompanies?.map(toDropdownItem) ?? [];

  const lookupIds = new Set(lookupItems.map((item) => item.id));
  const domainCompanyIds = domainCompanies?.map((company) => company.id) ?? [];

  const allItems = [
    ...lookupItems,
    ...domainItems.filter((item) => !lookupIds.has(item.id))
  ];

  const { prioritized, deprioritized } = groupItemsByPriority(
    allItems,
    domainCompanyIds
  );

  const priorityMarkedItems = prioritized.map((item) => ({
    ...item,
    isPrioritized: true
  }));

  return [...priorityMarkedItems, ...deprioritized];
};

export const mapContactToMetricItems = (
  contact: CrmContact,
  translateText: (
    keys: string[],
    interpolationValues?: Record<string, any>
  ) => string
): MetricItem[] => {
  const overdueChip =
    (contact.overdueTasksCount ?? 0) > 0
      ? {
          label: translateText(["metrics", "overdueChipLabel"], {
            count: contact.overdueTasksCount
          }),
          variant: CrmMetricLabelThemeEnum.RED
        }
      : undefined;

  return [
    {
      id: "openTasksCount",
      title: translateText(["metrics", "openTasks"]),
      amount: String(contact.openTasksCount ?? 0),
      chip: overdueChip
    },
    {
      id: "activeDealsCount",
      title: translateText(["metrics", "activeDeals"]),
      amount: String(contact.activeDealsCount ?? 0)
    },
    {
      id: "totalRevenue",
      title: translateText(["metrics", "totalRevenue"]),
      amount: contact.totalRevenue ?? "",
      isCurrency: true
    },
    {
      id: "pipelineRevenue",
      title: translateText(["metrics", "pipelineRevenue"]),
      amount: contact.pipelineRevenue ?? "",
      isCurrency: true
    }
  ];
};
