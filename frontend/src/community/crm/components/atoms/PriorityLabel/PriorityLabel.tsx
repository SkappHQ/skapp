import {
  HighPriorityIcon,
  Label,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import React from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmPriorityEnum } from "~community/crm/enums/common";

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
}

const PriorityLabel: React.FC<PriorityLabelProps> = ({ priority }) => {
  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  switch (priority?.toUpperCase()) {
    case CrmPriorityEnum.LOW:
      return (
        <Label
          backgroundColor="bg-semantic-green-background"
          className="py-2 px-3"
        >
          <LowPriorityIcon />
          <span className="body3 text-semantic-green-text">
            {translateText(["priorityOptions", "low"])}
          </span>
        </Label>
      );
    case CrmPriorityEnum.MEDIUM:
      return (
        <Label
          backgroundColor="bg-semantic-amber-background"
          className="py-2 px-3"
        >
          <MediumPriorityIcon />
          <span className="body3 text-semantic-amber-text">
            {translateText(["priorityOptions", "medium"])}
          </span>
        </Label>
      );
    case CrmPriorityEnum.HIGH:
      return (
        <Label
          backgroundColor="bg-semantic-red-background"
          className="py-2 px-3"
        >
          <HighPriorityIcon />
          <span className="body3 text-semantic-red-text">
            {translateText(["priorityOptions", "high"])}
          </span>
        </Label>
      );
    default:
      return null;
  }
};

export default PriorityLabel;
