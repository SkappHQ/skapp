import { ChecklistVerificationFilledIcon } from "@rootcodelabs/skapp-ui";
import { ReactElement, createElement } from "react";

import {
  convertUTCStringToLocalDateTime,
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  getCurrentDateAtMidnight,
  getDayDifference,
  isDateTimeSimilar
} from "~community/common/utils/dateTimeUtils";
import {
  PRIORITY_OPTIONS,
  TASK_TYPE_ICONS
} from "~community/crm/v2/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import {
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealRecord,
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";

export interface TaskDueDateInfo {
  textKey: string;
  dateValue?: string;
  dayCount?: number;
  colorClass: string;
}

export const getDueDateStatus = (
  dueAt?: string,
  isCompleted?: boolean
): TaskDueDateInfo | undefined => {
  if (dueAt) {
    const due = convertUTCStringToLocalDateTime(dueAt);
    const today = getCurrentDateAtMidnight();

    if (!isCompleted && due < today) {
      return {
        textKey: "dueDateOverdue",
        dayCount: getDayDifference(due, today),
        colorClass: "text-semantic-red-text"
      };
    }

    if (!isCompleted && isDateTimeSimilar(due, today)) {
      return { textKey: "dueDateToday", colorClass: "text-secondary-text" };
    }

    return {
      textKey: "dueDateDueOn",
      dateValue: formatDateTimeWithOrdinalIndicatorWithoutYear(due),
      colorClass: "text-secondary-text"
    };
  }
};

export const getTaskTypeIcon = (typeName = "", size = 20): ReactElement =>
  createElement(
    TASK_TYPE_ICONS[typeName.toLowerCase()] ?? ChecklistVerificationFilledIcon,
    { width: size, height: size }
  );

export const getPriorityConfig = (priority?: CrmPriorityEnum) => {
  const option = PRIORITY_OPTIONS.find(({ value }) => value === priority);

  if (option) {
    return {
      icon: createElement(option.IconComponent),
      bgColor: option.backgroundColor,
      textColor: option.textColor
    };
  }
};

export const getTaskTypeName = (
  taskTypes: CrmTaskTypeRecord,
  typeId?: number
) => {
  if (typeId !== undefined) {
    return taskTypes[typeId].name;
  }
};

export const normalizeTasks = (items: CrmTaskEntity[]) => {
  const tasks: CrmTaskRecord = {};
  const taskIds: number[] = [];

  items.forEach((task) => {
    if (task.id !== undefined) {
      tasks[task.id] = task;
      taskIds.push(task.id);
    }
  });

  return { tasks, taskIds };
};

export const parseDueDate = (dueAt?: string) => {
  if (dueAt !== undefined) {
    return convertUTCStringToLocalDateTime(dueAt).toJSDate();
  }
};

export const getTaskFormInitialValues = (
  selectedContactId: number | null
): CrmTaskEntity => {
  const initialValues: CrmTaskEntity = {
    name: "",
    priority: CrmPriorityEnum.MEDIUM,
    notes: ""
  };

  if (selectedContactId !== null) {
    initialValues.contactId = selectedContactId;
  }

  return initialValues;
};

export const getTrimmedTaskValues = (task: CrmTaskEntity): CrmTaskEntity => ({
  ...task,
  name: task.name?.trim(),
  notes: task.notes?.trim()
});

export interface CrmTaskRelatedRecords {
  companies: CrmCompanyRecord;
  contacts: CrmContactRecord;
  deals: CrmDealRecord;
}

export const linkTaskToRelatedEntities = (
  task: CrmTaskEntity,
  records: CrmTaskRelatedRecords
): CrmTaskRelatedRecords => {
  const linked: CrmTaskRelatedRecords = { ...records };

  if (task.id !== undefined) {
    const taskId = task.id;

    if (task.companyId !== undefined) {
      const company = records.companies[task.companyId];
      if (company?.taskIds !== undefined) {
        linked.companies = {
          ...records.companies,
          [task.companyId]: {
            ...company,
            taskIds: [...company.taskIds, taskId]
          }
        };
      }
    }

    if (task.contactId !== undefined) {
      const contact = records.contacts[task.contactId];
      if (contact?.taskIds !== undefined) {
        linked.contacts = {
          ...records.contacts,
          [task.contactId]: {
            ...contact,
            taskIds: [...contact.taskIds, taskId]
          }
        };
      }
    }

    if (task.dealId !== undefined) {
      const deal = records.deals[task.dealId];
      if (deal?.taskIds !== undefined) {
        linked.deals = {
          ...records.deals,
          [task.dealId]: { ...deal, taskIds: [...deal.taskIds, taskId] }
        };
      }
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
