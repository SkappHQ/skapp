import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import React, { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

import PriorityLabelItem from "./PriorityLabelItem";

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
  label: string;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority, label }) => {
  let backgroundColor: string;
  let icon: React.ReactNode;
  let textClassName: string;

  switch (priority) {
    case CrmPriorityEnum.LOW:
      backgroundColor = "bg-semantic-green-background";
      icon = <LowPriorityIcon />;
      textClassName = "text-semantic-green-text";
      break;
    case CrmPriorityEnum.MEDIUM:
      backgroundColor = "bg-semantic-amber-background";
      icon = <MediumPriorityIcon />;
      textClassName = "text-semantic-amber-text";
      break;
    case CrmPriorityEnum.HIGH:
      backgroundColor = "bg-semantic-red-background";
      icon = <HighPriorityIcon />;
      textClassName = "text-semantic-red-text";
      break;
    default:
      return null;
  }

  return (
    <PriorityLabelItem
      backgroundColor={backgroundColor}
      icon={icon}
      textClassName={textClassName}
      label={label}
    />
  );
};

export default PriorityLabel;
