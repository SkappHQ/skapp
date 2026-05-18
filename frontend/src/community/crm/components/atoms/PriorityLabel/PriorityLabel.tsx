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
  switch (priority.toLowerCase()) {
    case CrmPriorityEnum.HIGH:
      return (
        <Label
          backgroundColor="bg-semantic-red-background"
          textColor="text-semantic-red-text"
          className={className}
        >
          <span className="inline-flex items-center gap-1.5">
            <HighPriorityIcon />
            {priority}
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
            {priority}
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
            {priority}
          </span>
        </Label>
      );

    default:
      return null;
  }
};

export default PriorityLabel;
