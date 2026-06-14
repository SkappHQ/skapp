import React from 'react';
import {
  Label,
  LowPriorityIcon,
  MediumPriorityIcon,
  HighPriorityIcon,
} from '@rootcodelabs/skapp-ui';
import { CrmPriorityEnum } from '~community/crm/enums/common';
import { useTranslator } from '~community/common/hooks/useTranslator';

interface PriorityLabelProps {
  priority: CrmPriorityEnum;
  label?: string;
}

const PriorityLabel: React.FC<PriorityLabelProps> = ({ priority, label }) => {
  const translateText = useTranslator('crmModule', 'tasks', 'addTaskModal');

  switch (priority?.toUpperCase()) {
    case CrmPriorityEnum.LOW:
      return (
        <Label
          backgroundColor="bg-semantic-green-background"
          className="py-2 px-3"
        >
          <LowPriorityIcon />
          <span className="body3 text-semantic-green-text">
            {label ?? translateText(['priorityOptions', 'low'])}
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
            {label ?? translateText(['priorityOptions', 'medium'])}
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
            {label ?? translateText(['priorityOptions', 'high'])}
          </span>
        </Label>
      );
    default:
      return null;
  }
};

export default PriorityLabel;
