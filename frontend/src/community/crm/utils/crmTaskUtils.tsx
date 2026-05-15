import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { ReactElement } from "react";

import { IconName } from "~community/common/types/IconTypes";
import { CrmPriorityType } from "~community/crm/types/CommonTypes";

export interface PriorityConfig {
  icon: ReactElement;
  bgColor: string;
}

export interface TaskTypeConfig {
  bg: string;
  iconName: IconName;
}

export interface DueDateDisplay {
  text: string;
  colorClass: string;
}

export const getPriorityConfig = (
  priority: CrmPriorityType
): PriorityConfig => {
  switch (priority.name.toLowerCase()) {
    case "high":
      return { icon: <HighPriorityIcon />, bgColor: "bg-[#FFD6D9]" };
    case "medium":
      return { icon: <MediumPriorityIcon />, bgColor: "bg-[#FFF3C1]" };
    default:
      return { icon: <LowPriorityIcon />, bgColor: "bg-[#D8F999]" };
  }
};

export const TASK_TYPES = [
  { value: "email" as const, label: "Email" },
  { value: "call" as const, label: "Call" },
  { value: "meeting" as const, label: "Meeting" },
  { value: "other" as const, label: "Other" }
];

export type TaskTypeValue = (typeof TASK_TYPES)[number]["value"];

export const getTaskTypeConfig = (typeName: string): TaskTypeConfig => {
  switch (typeName.toLowerCase()) {
    case "email":
      return { bg: "#8e51ff", iconName: IconName.EMAIL_ICON };
    case "call":
    case "phone":
      return { bg: "#00bba7", iconName: IconName.LOCAL_PHONE_ICON };
    case "meeting":
      return { bg: "#3b82f6", iconName: IconName.CALENDAR_ICON };
    case "other":
      return { bg: "#6b7280", iconName: IconName.MORE_ICON };
    default:
      return { bg: "#8e51ff", iconName: IconName.EMAIL_ICON };
  }
};

export const getDueDateDisplay = (
  dueAt: string | null,
  isCompleted: boolean
): DueDateDisplay => {
  if (!dueAt) return { text: "No due date", colorClass: "text-[#9ca3af]" };

  const due = new Date(dueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  if (!isCompleted && dueDay < today) {
    return { text: "Overdue", colorClass: "text-[#82181a]" };
  }
  if (dueDay.getTime() === today.getTime()) {
    return { text: "Today", colorClass: "text-[#D97706]" };
  }
  return {
    text:
      "Due on " +
      due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    colorClass: "text-[#6B7280]"
  };
};