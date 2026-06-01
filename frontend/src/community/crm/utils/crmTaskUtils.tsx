import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { ReactElement, ReactNode } from "react";

import { CrmPriorityType } from "~community/crm/types/CommonTypes";

export interface PriorityConfig {
  icon: ReactElement;
  bgColor: string;
}

export interface DueDateDisplay {
  textKey: string;
  dateValue?: string;
  colorClass: string;
}

export const getPriorityConfig = (
  priority: CrmPriorityType
): PriorityConfig => {
  switch (priority.name.toLowerCase()) {
    case "high":
      return {
        icon: <HighPriorityIcon />,
        bgColor:
          "bg-semantic-red-background [&_path]:fill-[var(--color-semantic-amber-text)]"
      };
    case "medium":
      return {
        icon: <MediumPriorityIcon />,
        bgColor:
          "bg-amber-100 [&_path]:fill-[var(--color-semantic-amber-accent)]"
      };
    default:
      return {
        icon: <LowPriorityIcon />,
        bgColor:
          "bg-semantic-green-background [&_path]:fill-[var(--color-semantic-green-text)]"
      };
  }
};

export const TASK_TYPES = [
  { value: "email" as const, label: "Email" },
  { value: "call" as const, label: "Call" },
  { value: "meeting" as const, label: "Meeting" },
  { value: "other" as const, label: "Other" }
];

export type TaskTypeValue = (typeof TASK_TYPES)[number]["value"];

export const getTaskTypeConfig = (typeName: string): ReactNode => {
  switch (typeName.toLowerCase()) {
    case "email":
      return <EmailFilledIcon />;
    case "call":
      return <PhoneFilledIcon />;
    case "meeting":
      return <MeetingFilledIcon />;
    case "other":
      return <ChecklistVerificationFilledIcon />;
    default:
      return <ChecklistVerificationFilledIcon />;
  }
};

export interface TaskTypeOption {
  id: string;
  label: ReactNode;
  value: string;
  icon: ReactElement;
}

export const TASK_TYPE_OPTIONS: TaskTypeOption[] = TASK_TYPES.map((t) => ({
  id: t.value,
  value: t.value,
  icon: <div>{getTaskTypeConfig(t.value)}</div>,
  label: (
    <div className="flex items-center gap-2">
      <div>{getTaskTypeConfig(t.value)}</div>
      <span className="font-medium">{t.label}</span>
    </div>
  )
}));

export const getDueDateDisplay = (
  dueAt: string | null,
  isCompleted: boolean
): DueDateDisplay => {
  if (!dueAt) return { textKey: "dueDateNoDate", colorClass: "text-gray-400" };

  const due = DateTime.fromISO(dueAt).startOf("day");
  const today = DateTime.now().startOf("day");

  if (!isCompleted && due < today) {
    return { textKey: "dueDateOverdue", colorClass: "text-semantic-red-text" };
  }

  if (!isCompleted && due.equals(today)) {
    return { textKey: "dueDateToday", colorClass: "text-semantic-amber-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: due.toLocaleString({ month: "short", day: "numeric" }),
    colorClass: "text-gray-600"
  };
};
