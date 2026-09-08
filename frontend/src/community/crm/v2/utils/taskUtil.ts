import { convertUTCStringToLocalDateTime } from "~community/common/utils/dateTimeUtils";
import {
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealRecord,
  CrmTaskEntity,
  CrmTaskRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import { appendId } from "~community/crm/v2/utils/commonUtil";

export interface CrmTaskLinks {
  companies?: CrmCompanyRecord;
  contacts?: CrmContactRecord;
  deals?: CrmDealRecord;
}

const linkTaskToCompany = (
  companies: CrmCompanyRecord | undefined,
  companyId: number | undefined,
  taskId: number
): CrmCompanyRecord | undefined => {
  if (companies === undefined || companyId === undefined) return companies;

  const company = companies[companyId];

  if (company?.taskIds === undefined) return companies;

  const taskIds = appendId(company.taskIds, taskId);

  if (taskIds === company.taskIds) return companies;

  return { ...companies, [companyId]: { ...company, taskIds } };
};

const linkTaskToContact = (
  contacts: CrmContactRecord | undefined,
  contactId: number | undefined,
  taskId: number
): CrmContactRecord | undefined => {
  if (contacts === undefined || contactId === undefined) return contacts;

  const contact = contacts[contactId];

  if (contact?.taskIds === undefined) return contacts;

  const taskIds = appendId(contact.taskIds, taskId);

  if (taskIds === contact.taskIds) return contacts;

  return { ...contacts, [contactId]: { ...contact, taskIds } };
};

const linkTaskToDeal = (
  deals: CrmDealRecord | undefined,
  dealId: number | undefined,
  taskId: number
): CrmDealRecord | undefined => {
  if (deals === undefined || dealId === undefined) return deals;

  const deal = deals[dealId];

  if (deal?.taskIds === undefined) return deals;

  const taskIds = appendId(deal.taskIds, taskId);

  if (taskIds === deal.taskIds) return deals;

  return { ...deals, [dealId]: { ...deal, taskIds } };
};

export const linkTaskToRelatedEntities = (
  task: CrmTaskEntity,
  companies?: CrmCompanyRecord,
  contacts?: CrmContactRecord,
  deals?: CrmDealRecord
): CrmTaskLinks => {
  const taskId = task.id;

  if (taskId === undefined) {
    return { companies, contacts, deals };
  }

  return {
    companies: linkTaskToCompany(companies, task.companyId, taskId),
    contacts: linkTaskToContact(contacts, task.contactId, taskId),
    deals: linkTaskToDeal(deals, task.dealId, taskId)
  };
};

export const parseDueDate = (dueAt?: string): Date | undefined => {
  if (dueAt !== undefined) {
    return convertUTCStringToLocalDateTime(dueAt).toJSDate();
  }
};

export const updateTask = (
  tasks: CrmTaskRecord,
  taskId: number,
  updatedFields: CrmTaskEntity
): CrmTaskRecord => ({
  ...tasks,
  [taskId]: { ...tasks[taskId], ...updatedFields }
});

export interface CrmTaskCompletion {
  taskId: number;
  isCompleted: boolean;
}

export const applyTaskCompletion = (
  tasks: CrmTaskRecord,
  { taskId, isCompleted }: CrmTaskCompletion
): CrmTaskRecord => updateTask(tasks, taskId, { isCompleted });
