import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { ReactElement } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

interface TaskTypeIconConfig {
  icon: ReactElement;
  backgroundColor: string;
}

const TASK_TYPE_ICON_MAP: Record<string, TaskTypeIconConfig> = {
  Call: {
    icon: <PhoneFilledIcon />,
    backgroundColor: "bg-[#00bba7]"
  },
  Email: {
    icon: <EmailFilledIcon />,
    backgroundColor: "bg-[#7C5CFC]"
  },
  Meeting: {
    icon: <MeetingFilledIcon />,
    backgroundColor: "bg-[#F59E0B]"
  }
};

const DEFAULT_TASK_TYPE_ICON: TaskTypeIconConfig = {
  icon: <ChecklistVerificationFilledIcon />,
  backgroundColor: "bg-[#3B82F6]"
};

export const getTaskTypeIcon = (
  typeName: string,
  size: "sm" | "md" = "md"
): ReactElement => {
  const config = TASK_TYPE_ICON_MAP[typeName] ?? DEFAULT_TASK_TYPE_ICON;
  const sizeClass = size === "sm" ? "size-5 p-1" : "size-6 p-[4.8px]";
  const iconSizeClass = size === "sm" ? "size-3" : "size-[14.4px]";

  return (
    <span
      className={`${config.backgroundColor} inline-flex items-center justify-center rounded-full ${sizeClass} shrink-0`}
    >
      <span className={`${iconSizeClass} text-white flex items-center`}>
        {config.icon}
      </span>
    </span>
  );
};

export const getPriorityConfig = (
  priority: CrmPriorityEnum
): { backgroundColor: string; textColor: string } => {
  switch (priority) {
    case CrmPriorityEnum.HIGH:
      return {
        backgroundColor: "bg-semantic-red-background",
        textColor: "text-semantic-red-text"
      };
    case CrmPriorityEnum.MEDIUM:
      return {
        backgroundColor: "bg-semantic-amber-background",
        textColor: "text-semantic-amber-text"
      };
    case CrmPriorityEnum.LOW:
      return {
        backgroundColor: "bg-semantic-green-background",
        textColor: "text-semantic-green-text"
      };
  }
};
