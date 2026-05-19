import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { ReactElement, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
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

export interface TaskTypeOption {
  id: string;
  label: ReactNode;
  value: string;
  icon: ReactElement;
}

export const TASK_TYPE_OPTIONS: TaskTypeOption[] = [
  { id: "email", label: "Email", value: "email" },
  { id: "call", label: "Call", value: "call" },
  { id: "meeting", label: "Meeting", value: "meeting" },
  { id: "other", label: "Other", value: "other" }
].map((t) => {
  const config = getTaskTypeConfig(t.value);
  const iconEl = (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: config.bg }}
    >
      {config.iconName === IconName.EMAIL_ICON ? (
        <div className="flex items-center justify-center">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 6.5L2 4V9H10V4L6 6.5Z" fill="white" fillOpacity="0.3" />
            <path
              d="M2 2.5H10C10.275 2.5 10.5 2.725 10.5 3V9C10.5 9.275 10.275 9.5 10 9.5H2C1.725 9.5 1.5 9.275 1.5 9V3C1.5 2.725 1.725 2.5 2 2.5Z"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1.5 3.25L6 6L10.5 3.25"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : config.iconName === IconName.LOCAL_PHONE_ICON ? (
        <div className="flex items-center justify-center">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M7.50005 8.915C8.14505 9.185 8.81505 9.36 9.50005 9.45V8.335L8.32505 8.1L7.50005 8.915ZM3.66505 2.5H2.55005C2.64005 3.185 2.81505 3.85 3.08505 4.5L3.90005 3.675L3.66505 2.5Z"
              fill="white"
            />
            <path
              d="M10.0999 7.435L8.26495 7.07C8.01495 7.02 7.84995 7.17 7.81495 7.205L6.55495 8.455C5.30495 7.74 4.26995 6.705 3.55495 5.455L4.80495 4.195C4.91995 4.075 4.96995 3.91 4.93995 3.745L4.56495 1.9C4.51995 1.67 4.31495 1.5 4.07495 1.5H1.99995C1.71995 1.5 1.48495 1.735 1.49995 2.015C1.58495 3.46 2.02495 4.815 2.71495 6C3.50495 7.365 4.63995 8.495 5.99995 9.285C7.18495 9.97 8.53995 10.415 9.98495 10.5C10.2599 10.515 10.4999 10.285 10.4999 10V7.925C10.4999 7.685 10.3299 7.48 10.0999 7.435ZM2.54995 2.5H3.66495L3.89995 3.675L3.08495 4.5C2.81495 3.85 2.63495 3.185 2.54995 2.5ZM9.49995 9.45C8.81495 9.36 8.14995 9.185 7.49995 8.915L8.32495 8.1L9.49995 8.335V9.45Z"
              fill="white"
            />
          </svg>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Icon name={config.iconName} fill="white" width="12" height="12" />
        </div>
      )}
    </div>
  );
  return {
    id: t.id,
    value: t.value,
    icon: iconEl,
    label: (
      <div className="flex items-center gap-2">
        {iconEl}
        <span className="font-medium">{t.label}</span>
      </div>
    )
  };
});

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
