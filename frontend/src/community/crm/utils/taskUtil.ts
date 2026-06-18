import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { isBefore, isToday, parseISO, startOfDay } from "date-fns";
import { DateTime } from "luxon";
import React, { ComponentType, ReactElement, createElement } from "react";

import {
  convertDateToUTC,
  formatDateTimeWithOrdinalIndicatorWithoutYear
} from "~community/common/utils/dateTimeUtils";
import { priorityOptions } from "~community/crm/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";

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

  const due = parseISO(convertDateToUTC(dueAt));

  if (!isCompleted && isBefore(due, startOfDay(new Date()))) {
    return { textKey: "dueDateOverdue", colorClass: "text-semantic-red-text" };
  }

  if (!isCompleted && isToday(due)) {
    return { textKey: "dueDateToday", colorClass: "text-semantic-amber-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: formatDateTimeWithOrdinalIndicatorWithoutYear(
      DateTime.fromJSDate(due)
    ),
    colorClass: "text-secondary-text"
  };
};

const TASK_TYPE_ICON_MAP: Record<string, ComponentType> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (typeName: string): ReactElement => {
  return createElement(TASK_TYPE_ICON_MAP[typeName.toLowerCase()]);
};

export const getPriorityConfig = (
  priority: CrmPriorityEnum
): { icon: ReactElement; bgColor: string } => {
  const option = priorityOptions.find((o) => o.value === priority)!;
  return {
    icon: createElement(option.IconComponent),
    bgColor: option.backgroundColor
  };
};
