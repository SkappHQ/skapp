import {
  HighPriorityIcon,
  Label,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

interface Props {
  priority: CrmPriorityEnum;
  label: string;
}

interface PriorityLabelConfig {
  bg: string;
  text: string;
  icon: ReactNode;
}

const PRIORITY_LABEL_CONFIG: Record<CrmPriorityEnum, PriorityLabelConfig> = {
  [CrmPriorityEnum.HIGH]: {
    bg: "bg-semantic-red-background",
    text: "text-semantic-red-text",
    icon: <HighPriorityIcon size={12} />
  },
  [CrmPriorityEnum.MEDIUM]: {
    bg: "bg-semantic-amber-background",
    text: "text-semantic-amber-text",
    icon: <MediumPriorityIcon size={12} />
  },
  [CrmPriorityEnum.LOW]: {
    bg: "bg-semantic-green-background",
    text: "text-semantic-green-text",
    icon: <LowPriorityIcon size={12} />
  }
};

const PriorityLabel: FC<Props> = ({ priority, label }) => {
  const config = PRIORITY_LABEL_CONFIG[priority];
  if (!config) return null;

  return (
    <Label
      backgroundColor={config.bg}
      textColor={config.text}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium"
    >
      {config.icon}
      <span>{label}</span>
    </Label>
  );
};

export default PriorityLabel;
