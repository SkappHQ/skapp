import { HighPriorityIcon, LowPriorityIcon, MediumPriorityIcon } from "@rootcodelabs/skapp-ui";
import React from "react";

import { IconName } from "~community/common/types/IconTypes";
import { CrmPriorityType, CrmTaskCategory } from "~community/crm/types/CommonTypes";

export interface TaskTypeConfig {
  bg: string;
  iconName: IconName;
}

export interface PriorityConfig {
  icon: React.ReactNode;
  bgColor: string;
}

export interface DueDateDisplay {
  text: string;
  colorClass: string;
}

export interface TaskTypeOption {
  id: string;
  label: string;
  value: string;
}

const taskTypeConfigMap: Record<string, TaskTypeConfig> = {
  call: { bg: "#14b8a6", iconName: IconName.PHONE_ICON },
  email: { bg: "#a855f7", iconName: IconName.EMAIL_ICON },
  meeting: { bg: "#3b82f6", iconName: IconName.CALENDAR_ICON },
  task: { bg: "#6b7280", iconName: IconName.CHECK_CIRCLE_ICON }
};

const defaultTaskTypeConfig: TaskTypeConfig = {
  bg: "#6b7280",
  iconName: IconName.CHECK_CIRCLE_ICON
};

export const TASK_TYPE_OPTIONS: TaskTypeOption[] = [
  { id: "call", label: "Call", value: "call" },
  { id: "email", label: "Email", value: "email" },
  { id: "meeting", label: "Meeting", value: "meeting" },
  { id: "task", label: "Task", value: "task" }
];

export const getTaskTypeConfig = (typeName: string): TaskTypeConfig => {
  return taskTypeConfigMap[typeName?.toLowerCase()] ?? defaultTaskTypeConfig;
};

export const getPriorityConfig = (priority: CrmPriorityType): PriorityConfig => {
  switch (priority?.name?.toLowerCase()) {
    case "high":
      return { icon: <HighPriorityIcon />, bgColor: "#fee2e2" };
    case "medium":
      return { icon: <MediumPriorityIcon />, bgColor: "#fef3c7" };
    case "low":
      return { icon: <LowPriorityIcon />, bgColor: "#dbeafe" };
    default:
      return { icon: <LowPriorityIcon />, bgColor: "#f3f4f6" };
  }
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const getDueDateDisplay = (
  dueAt: string | null,
  isCompleted: boolean
): DueDateDisplay => {
  if (!dueAt) return { text: "No due date", colorClass: "text-zinc-400" };

  if (isCompleted) {
    return { text: formatDate(dueAt), colorClass: "text-zinc-400" };
  }

  const dueDate = new Date(dueAt);
  const now = new Date();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateDay = new Date(dueAt);
  dueDateDay.setHours(0, 0, 0, 0);

  const diffMs = dueDateDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (dueDate < now && diffDays < 0) {
    return {
      text: `Overdue · ${formatDate(dueAt)}`,
      colorClass: "text-red-600"
    };
  }

  if (diffDays === 0) {
    return { text: "Due today", colorClass: "text-amber-600" };
  }

  if (diffDays === 1) {
    return { text: "Due tomorrow", colorClass: "text-amber-500" };
  }

  return { text: `Due ${formatDate(dueAt)}`, colorClass: "text-zinc-500" };
};
