import { Chip } from "@rootcodelabs/skapp-ui";
import { ReactElement } from "react";

export interface ActivityChipFilterFieldProps<T extends string> {
  id: string;
  label: string;
  options: { value: T; label: string }[];
  selectedValue?: T;
  onChange: (value: T | null) => void;
}

const ActivityChipFilterField = <T extends string>({
  id,
  label,
  options,
  selectedValue,
  onChange
}: ActivityChipFilterFieldProps<T>): ReactElement => (
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
