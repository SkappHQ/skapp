import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { ComponentType, ReactElement, createElement } from "react";

import {
  convertUTCStringToLocalDateTime,
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  getCurrentDateAtMidnight,
  isDateTimeSimilar
} from "~community/common/utils/dateTimeUtils";
import { PRIORITY_OPTIONS } from "~community/crm/constants/taskConstants";
import { CrmPriorityEnum, CrmTaskTabEnum } from "~community/crm/enums/common";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

import { isDueToday, isDueTomorrow, isOverdue } from "./taskValidations";

export interface TaskDueDateInfo {
  textKey: string;
  dateValue?: string;
  colorClass: string;
}

export const getDueDateStatus = (
  dueAt: string | null,
  isCompleted: boolean
): TaskDueDateInfo | null => {
  if (!dueAt) return null;

  const due = convertUTCStringToLocalDateTime(dueAt);
  const today = getCurrentDateAtMidnight();

  if (!isCompleted && due < today) {
    return { textKey: "dueDateOverdue", colorClass: "text-semantic-red-text" };
  }

  if (!isCompleted && isDateTimeSimilar(due, today)) {
    return { textKey: "dueDateToday", colorClass: "text-semantic-amber-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: formatDateTimeWithOrdinalIndicatorWithoutYear(due),
    colorClass: "text-secondary-text"
  };
};

const TASK_TYPE_ICON_MAP: Record<string, ComponentType> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (
  typeName: string,
  width?: string,
  height?: string
): ReactElement => {
  const props = width || height ? { width, height } : undefined;
  return createElement(TASK_TYPE_ICON_MAP[typeName.toLowerCase()], props);
};

export const getPriorityConfig = (
  priority: CrmPriorityEnum
): { icon: ReactElement; bgColor: string; textColor?: string } => {
  const option = PRIORITY_OPTIONS.find((o) => o.value === priority)!;
  return {
    icon: createElement(option.IconComponent),
    bgColor: option.backgroundColor,
    textColor: option.textColor
  };
};

export interface GroupedTasks {
  overdue: CrmTaskDetailType[];
  dueToday: CrmTaskDetailType[];
  dueTomorrow: CrmTaskDetailType[];
  upcoming: CrmTaskDetailType[];
  isOpenTasksEmpty: boolean;
}

export const groupTasksByDueDate = (
  tasks: CrmTaskDetailType[]
): GroupedTasks => {
  const overdue: CrmTaskDetailType[] = [];
  const dueToday: CrmTaskDetailType[] = [];
  const dueTomorrow: CrmTaskDetailType[] = [];
  const upcoming: CrmTaskDetailType[] = [];

  for (const task of tasks) {
    const localDueDate = task.dueAt
      ? convertUTCStringToLocalDateTime(task.dueAt).toISO()
      : null;

    if (!localDueDate) {
      upcoming.push(task);
    } else if (isOverdue(localDueDate)) {
      overdue.push(task);
    } else if (isDueToday(localDueDate)) {
      dueToday.push(task);
    } else if (isDueTomorrow(localDueDate)) {
      dueTomorrow.push(task);
    } else {
      upcoming.push(task);
    }
  }

  const isOpenTasksEmpty =
    overdue.length === 0 &&
    dueToday.length === 0 &&
    dueTomorrow.length === 0 &&
    upcoming.length === 0;

  return {
    overdue,
    dueToday,
    dueTomorrow,
    upcoming,
    isOpenTasksEmpty
  };
};

export const getTaskGroups = (
  tasks: CrmTaskDetailType[],
  tab: CrmTaskTabEnum,
  userId: number | undefined
): GroupedTasks => {
  const filteredTasks =
    tab === CrmTaskTabEnum.MY_TASKS
      ? tasks.filter((task) => task.owner.employeeId === userId)
      : tasks;
  return groupTasksByDueDate(filteredTasks);
};
