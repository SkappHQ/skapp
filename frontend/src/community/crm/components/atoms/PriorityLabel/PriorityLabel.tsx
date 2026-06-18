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
  switch (priority) {
    case CrmPriorityEnum.LOW:
      return (
        <PriorityLabelItem
          backgroundColor="bg-semantic-green-background"
          icon={<LowPriorityIcon />}
          textClassName="text-semantic-green-text"
          label={label}
        />
      );
    case CrmPriorityEnum.MEDIUM:
      return (
        <PriorityLabelItem
          backgroundColor="bg-semantic-amber-background"
          icon={<MediumPriorityIcon />}
          textClassName="text-semantic-amber-text"
          label={label}
        />
      );
    case CrmPriorityEnum.HIGH:
      return (
        <PriorityLabelItem
          backgroundColor="bg-semantic-red-background"
          icon={<HighPriorityIcon />}
          textClassName="text-semantic-red-text"
          label={label}
        />
      );
    default:
      return null;
  }
};

export default PriorityLabel;
