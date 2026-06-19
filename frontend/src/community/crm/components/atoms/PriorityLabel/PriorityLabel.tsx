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
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority }) => {
  switch (priority) {
    case CrmPriorityEnum.LOW:
      return (
        <PriorityLabelItem
          backgroundColor="bg-semantic-green-background"
          icon={<LowPriorityIcon />}
        />
      );
    case CrmPriorityEnum.MEDIUM:
      return (
        <PriorityLabelItem
          backgroundColor="bg-semantic-amber-background"
          icon={<MediumPriorityIcon />}
        />
      );
    case CrmPriorityEnum.HIGH:
      return (
        <PriorityLabelItem
          backgroundColor="bg-semantic-red-background"
          icon={<HighPriorityIcon />}
        />
      );
    default:
      return null;
  }
};

export default PriorityLabel;
