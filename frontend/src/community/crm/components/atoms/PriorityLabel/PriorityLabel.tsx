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
}

const PRIORITY_CONFIG: Record<
  CrmPriorityEnum,
  { backgroundColor: string; icon: ReactNode }
> = {
  [CrmPriorityEnum.LOW]: {
    backgroundColor: "bg-semantic-green-background",
    icon: <LowPriorityIcon />
  },
  [CrmPriorityEnum.MEDIUM]: {
    backgroundColor: "bg-semantic-amber-background",
    icon: <MediumPriorityIcon />
  },
  [CrmPriorityEnum.HIGH]: {
    backgroundColor: "bg-semantic-red-background",
    icon: <HighPriorityIcon />
  }
};

const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority];
  if (!config) return null;

  return (
    <PriorityLabelItem
      backgroundColor={config.backgroundColor}
      icon={config.icon}
    />
  );
};

export default PriorityLabel;
