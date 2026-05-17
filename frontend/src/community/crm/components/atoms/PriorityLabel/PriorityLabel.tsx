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
          backgroundColor="bg-label-bg-peach"
          textColor="text-label-text-peach"
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
          backgroundColor="bg-label-bg-lemon"
          textColor="text-label-text-lemon"
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
          backgroundColor="bg-label-bg-mint"
          textColor="text-label-text-mint"
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
