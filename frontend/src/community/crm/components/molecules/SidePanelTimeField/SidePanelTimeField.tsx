import { Dropdown } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC } from "react";

import {
  TIME_FORMAT_12_HOUR_PADDED,
  TIME_FORMAT_24_HOUR
} from "~community/common/constants/timeConstants";
import { getActivityTimeOptions } from "~community/crm/activities/utils/activityUtil";

interface Props {
  id: string;
  value: string;
  placeholder: string;
  ariaLabel: string;
  errorMessage?: string;
  onChange: (value: string) => void;
}

const SidePanelTimeField: FC<Props> = ({
  id,
  value,
  placeholder,
  ariaLabel,
  errorMessage,
  onChange
}) => {
  const timeOptions = getActivityTimeOptions();
  const isValueListed = timeOptions.some((option) => option.value === value);

  const options =
    value && !isValueListed
      ? [
          {
            id: value,
            value,
            label: DateTime.fromFormat(value, TIME_FORMAT_24_HOUR).toFormat(
              TIME_FORMAT_12_HOUR_PADDED
            )
          },
          ...timeOptions
        ]
      : timeOptions;

  return (
    <Dropdown
      id={id}
      value={value}
      options={options}
      onChange={(selectedValue) => onChange(String(selectedValue))}
      placeholder={placeholder}
      variant="jsx-content"
      menuWidth="match"
      height="min-h-8"
      width="100%"
      hideArrowIcon
      padding="py-2 px-1"
      className="w-full bg-transparent border-none rounded-lg"
      ariaLabel={ariaLabel}
      scrollToSelected
      {...(errorMessage && { errorMessage })}
    />
  );
};

export default SidePanelTimeField;
