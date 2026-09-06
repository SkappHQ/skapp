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

export const linkTaskToRelatedEntities = (
  task: CrmTaskEntity,
  companies?: CrmCompanyRecord,
  contacts?: CrmContactRecord,
  deals?: CrmDealRecord
): CrmTaskLinks => {
  const taskId = task.id;
  const linked = { companies, contacts, deals };

  if (taskId === undefined) {
    return linked;
  }

  if (companies !== undefined && task.companyId !== undefined) {
    const company = companies[task.companyId];

    if (company?.taskIds !== undefined) {
      const taskIds = appendId(company.taskIds, taskId);

      if (taskIds !== company.taskIds) {
        linked.companies = {
          ...companies,
          [task.companyId]: { ...company, taskIds }
        };
      }
    }
  }

  if (contacts !== undefined && task.contactId !== undefined) {
    const contact = contacts[task.contactId];

    if (contact?.taskIds !== undefined) {
      const taskIds = appendId(contact.taskIds, taskId);

      if (taskIds !== contact.taskIds) {
        linked.contacts = {
          ...contacts,
          [task.contactId]: { ...contact, taskIds }
        };
      }
    }
  }

  if (deals !== undefined && task.dealId !== undefined) {
    const deal = deals[task.dealId];

    if (deal?.taskIds !== undefined) {
      const taskIds = appendId(deal.taskIds, taskId);

      if (taskIds !== deal.taskIds) {
        linked.deals = { ...deals, [task.dealId]: { ...deal, taskIds } };
      }
    }
  }

  return linked;
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
