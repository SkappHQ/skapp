import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import {
  ActivityChipFilterOption,
  ActivityTaskStatus
} from "~community/crm/activities/types/activityTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";

export interface ActivityChipFilterFieldProps {
  id: string;
  label: string;
  options: ActivityChipFilterOption[];
  selectedValue?: ActivityTaskStatus | CrmPriorityEnum;
  onChange: (value: ActivityTaskStatus | CrmPriorityEnum | null) => void;
}

const ActivityChipFilterField: FC<ActivityChipFilterFieldProps> = ({
  id,
  label,
  options,
  selectedValue,
  onChange
}) => (
  <fieldset
    id={id}
    aria-labelledby={`${id}-label`}
    className="flex min-w-0 flex-col gap-3"
  >
    <p id={`${id}-label`} className="subtitle1">
      {label}
    </p>

    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip
          key={option.value}
          size="sm"
          label={option.label}
          isSelected={selectedValue === option.value}
          onClick={() =>
            onChange(selectedValue === option.value ? null : option.value)
          }
        />
      ))}
    </div>
  </fieldset>
);

export default ActivityChipFilterField;
