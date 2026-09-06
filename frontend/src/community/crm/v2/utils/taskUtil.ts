import {
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealRecord,
  CrmTaskEntity,
  CrmTaskRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import { appendId } from "~community/crm/v2/utils/commonUtil";

export const linkTaskToRelatedEntities = (
  task: CrmTaskEntity,
  companies?: CrmCompanyRecord,
  contacts?: CrmContactRecord,
  deals?: CrmDealRecord
) => {
  const taskId = task.id;
  const linked = { companies, contacts, deals };

  if (taskId === undefined) {
    return linked;
  }

  if (companies !== undefined && task.companyId !== undefined) {
    const company = companies[task.companyId];

    if (company?.taskIds !== undefined) {
      linked.companies = {
        ...companies,
        [task.companyId]: {
          ...company,
          taskIds: appendId(company.taskIds, taskId)
        }
      };
    }
  }

  if (contacts !== undefined && task.contactId !== undefined) {
    const contact = contacts[task.contactId];

    if (contact?.taskIds !== undefined) {
      linked.contacts = {
        ...contacts,
        [task.contactId]: {
          ...contact,
          taskIds: appendId(contact.taskIds, taskId)
        }
      };
    }
  }

  if (deals !== undefined && task.dealId !== undefined) {
    const deal = deals[task.dealId];

    if (deal?.taskIds !== undefined) {
      linked.deals = {
        ...deals,
        [task.dealId]: { ...deal, taskIds: appendId(deal.taskIds, taskId) }
      };
    }
  }

  return linked;
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
