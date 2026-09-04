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
  TASK_TYPE_ICONS,
  TASK_TYPE_ICON_SIZE
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
import { appendId } from "~community/crm/v2/utils/commonUtil";

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

export const getTaskTypeIcon = (
  typeName = "",
  size = TASK_TYPE_ICON_SIZE
): ReactElement =>
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
  selectedContactId: number | null,
  currentUserId?: string | number
): CrmTaskEntity => {
  const initialValues: CrmTaskEntity = {
    name: "",
    priority: CrmPriorityEnum.MEDIUM,
    notes: ""
  };

  if (selectedContactId !== null) {
    initialValues.contactId = selectedContactId;
  }

  if (currentUserId !== undefined) {
    initialValues.ownerId = Number(currentUserId);
  }

  return initialValues;
};

export const getTrimmedTaskValues = (task: CrmTaskEntity): CrmTaskEntity => ({
  ...task,
  name: task.name?.trim(),
  notes: task.notes?.trim()
});

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

    if (company !== undefined) {
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

    if (contact !== undefined) {
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

    if (deal !== undefined) {
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
