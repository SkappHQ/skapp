import {
  EmailFilledIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  MeetingFilledIcon,
  OtherFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { ReactElement, ReactNode } from "react";

export interface PriorityConfig {
  icon: ReactElement;
  bgColor: string;
}

export interface DueDateDisplay {
  text: string;
  colorClass: string;
}

export const getPriorityConfig = (
  priority: { name: string }
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

export const getTaskTypeConfig = (typeName: string): ReactNode => {
  switch (typeName.toLowerCase()) {
    case "email":
      return <EmailFilledIcon />;
    case "call":
      return <PhoneFilledIcon />;
    case "meeting":
      return <MeetingFilledIcon />;
    case "other":
      return <OtherFilledIcon />;
    default:
      return <EmailFilledIcon />;
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
  const iconEl = (
    <div>
      {getTaskTypeConfig(t.value)}
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
