import {
  HighPriorityIcon,
  Label,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

interface Props {
  priority: string;
  className?: string;
}

const PriorityLabel: FC<Props> = ({ priority, className = "" }) => {
  const displayText = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  switch (priority.toUpperCase()) {
    case CrmPriorityEnum.HIGH:
      return (
        <Label
          backgroundColor="bg-semantic-red-background"
          textColor="text-semantic-red-text"
          className={className}
        >
          <span className="inline-flex items-center gap-1.5">
            <HighPriorityIcon />
            {displayText}
          </span>
        </Label>
      );

    case CrmPriorityEnum.MEDIUM:
      return (
        <Label
          backgroundColor="bg-semantic-amber-background"
          textColor="text-semantic-amber-text"
          className={className}
        >
          <span className="inline-flex items-center gap-1.5">
            <MediumPriorityIcon />
            {displayText}
          </span>
        </Label>
      );

    case CrmPriorityEnum.LOW:
      return (
        <Label
          backgroundColor="bg-semantic-green-background"
          textColor="text-semantic-green-text"
          className={className}
        >
          <span className="inline-flex items-center gap-1.5">
            <LowPriorityIcon />
            {displayText}
          </span>
        </Label>
      );

    default:
      return null;
  }
};

export default PriorityLabel;
