import { DatePicker } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC } from "react";

import { SHORT_MONTH_YEAR_FORMAT } from "~community/common/constants/timeConstants";
import { formatDayWithOrdinalIndicator } from "~community/common/utils/dateTimeUtils";

interface Props {
  id: string;
  date: DateTime;
  ariaLabel: string;
  onChange: (date: Date) => void;
}

const SidePanelDateField: FC<Props> = ({ id, date, ariaLabel, onChange }) => {
  const handleSelect = (pickedDate?: Date): void => {
    if (pickedDate) onChange(pickedDate);
  };

  return (
    <div className="w-full">
      <DatePicker
        mode="single"
        selected={date.toJSDate()}
        onSelect={handleSelect}
        popperProps={{
          position: "bottom-end",
          isFlip: true,
          positionStrategy: "fixed"
        }}
      >
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          className="body2 w-full min-h-8 px-1 rounded-lg text-left cursor-pointer hover:bg-secondary-background"
        >
          {`${formatDayWithOrdinalIndicator(date)} ${date.toFormat(SHORT_MONTH_YEAR_FORMAT)}`}
        </button>
      </DatePicker>
    </div>
  );
};

export default SidePanelDateField;
