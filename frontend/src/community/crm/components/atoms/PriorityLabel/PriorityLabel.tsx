import {
  HighPriorityIcon,
  Label,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import React, { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
  label: string;
}

const PriorityLabel: FC<PriorityLabelProps> = ({ priority, label }) => {
  switch (priority?.toUpperCase()) {
    case CrmPriorityEnum.LOW:
      return (
        <Label
          backgroundColor="bg-semantic-green-background"
          className="py-2 px-3"
        >
          <LowPriorityIcon />
          <span className="body3 text-semantic-green-text">{label}</span>
        </Label>
      );
    case CrmPriorityEnum.MEDIUM:
      return (
        <Label
          backgroundColor="bg-semantic-amber-background"
          className="py-2 px-3"
        >
          <MediumPriorityIcon />
          <span className="body3 text-semantic-amber-text">{label}</span>
        </Label>
      );
    case CrmPriorityEnum.HIGH:
      return (
        <Label
          backgroundColor="bg-semantic-red-background"
          className="py-2 px-3"
        >
          <HighPriorityIcon />
          <span className="body3 text-semantic-red-text">{label}</span>
        </Label>
      );
    default:
      return null;
  }
};

export default PriorityLabel;
