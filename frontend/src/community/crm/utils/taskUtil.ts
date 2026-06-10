import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { format, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import React, { ComponentType } from "react";

import { priorityOptions } from "~community/crm/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";

export interface DueDateDisplay {
  textKey: string;
  dateValue?: string;
  colorClass: string;
}

export const getDueDateDisplay = (
  dueAt: string | null,
  isCompleted: boolean
): DueDateDisplay | null => {
  if (!dueAt) return null;

  const due = startOfDay(parseISO(dueAt));

  if (!isCompleted && isBefore(due, startOfDay(new Date()))) {
    return { textKey: "dueDateOverdue", colorClass: "text-semantic-red-text" };
  }

  if (!isCompleted && isToday(due)) {
    return { textKey: "dueDateToday", colorClass: "text-semantic-amber-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: format(due, "do LLL"),
    colorClass: "text-secondary-text"
  };
};

const TASK_TYPE_ICON_MAP: Record<string, ComponentType> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (typeName: string): React.ReactElement => {
  return React.createElement(TASK_TYPE_ICON_MAP[typeName.toLowerCase()]);
};

export const getPriorityConfig = (
  priority: CrmPriorityEnum
): { icon: React.ReactElement; bgColor: string } => {
  const option = priorityOptions.find((o) => o.value === priority)!;
  return {
    icon: React.createElement(option.IconComponent),
    bgColor: option.bgColor
  };
};
