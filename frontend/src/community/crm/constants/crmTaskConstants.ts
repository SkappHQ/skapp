import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityType } from "~community/crm/types/CommonTypes";

export interface PriorityConfig {
  IconComponent: FC;
  bgColor: string;
}

const PRIORITY_CONFIG_MAP: Record<string, PriorityConfig> = {
  high: {
    IconComponent: HighPriorityIcon,
    bgColor:
      "bg-semantic-red-background [&_path]:fill-[var(--color-semantic-amber-text)]"
  },
  medium: {
    IconComponent: MediumPriorityIcon,
    bgColor: "bg-amber-100 [&_path]:fill-[var(--color-semantic-amber-accent)]"
  },
  low: {
    IconComponent: LowPriorityIcon,
    bgColor:
      "bg-semantic-green-background [&_path]:fill-[var(--color-semantic-green-text)]"
  }
};

export const getPriorityConfig = (priority: CrmPriorityType): PriorityConfig =>
  PRIORITY_CONFIG_MAP[priority.name.toLowerCase()] ?? PRIORITY_CONFIG_MAP.low;

// TODO: Task types are dynamic (fetched from the backend API).

const TASK_TYPE_ICON_MAP: Record<string, FC> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (typeName: string): FC =>
  TASK_TYPE_ICON_MAP[typeName.toLowerCase()] ?? ChecklistVerificationFilledIcon;

export const getTasksPageTabs = (translateText: (keys: string[]) => string) => [
  { id: "my-tasks", label: translateText(["tabs", "myTasks"]) },
  { id: "team-tasks", label: translateText(["tabs", "teamTasks"]) },
  { id: "completed", label: translateText(["tabs", "completed"]) }
];

// TODO: Replace with data from the task types API endpoint
export const TASK_TYPES = [
  { value: "email" as const, label: "Email" },
  { value: "call" as const, label: "Call" },
  { value: "meeting" as const, label: "Meeting" },
  { value: "other" as const, label: "Other" }
] as const;

export type TaskTypeValue = (typeof TASK_TYPES)[number]["value"];
