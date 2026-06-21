import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

import PriorityLabelItem from "./PriorityLabelItem";

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
  label: string;
}

const PRIORITY_CONFIG: Record<
  CrmPriorityEnum,
  { backgroundColor: string; icon: ReactNode; textClassName: string }
> = {
  [CrmPriorityEnum.LOW]: {
    backgroundColor: "bg-semantic-green-background",
    icon: <LowPriorityIcon />,
    textClassName: "text-semantic-green-text"
  },
  [CrmPriorityEnum.MEDIUM]: {
    backgroundColor: "bg-semantic-amber-background",
    icon: <MediumPriorityIcon />,
    textClassName: "text-semantic-amber-text"
  },
  [CrmPriorityEnum.HIGH]: {
    backgroundColor: "bg-semantic-red-background",
    icon: <HighPriorityIcon />,
    textClassName: "text-semantic-red-text"
  }
};

const PriorityLabel: FC<PriorityLabelProps> = ({ priority, label }) => {
  const config = PRIORITY_CONFIG[priority];
  if (!config) return null;

  return (
    <PriorityLabelItem
      backgroundColor={config.backgroundColor}
      icon={config.icon}
      textClassName={config.textClassName}
      label={label}
    />
  );
};

export default PriorityLabel;
