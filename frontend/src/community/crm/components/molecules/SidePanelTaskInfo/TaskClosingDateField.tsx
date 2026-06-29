import { FC } from "react";

import {
  convertUTCStringToLocalDateTime,
  formatDateTimeWithOrdinalIndicator
} from "~community/common/utils/dateTimeUtils";

interface Props {
  dueAt: string | null;
  label: string;
  noneText: string;
}

const TaskClosingDateField: FC<Props> = ({ dueAt, label, noneText }) => {
  return (
    <div className="flex flex-1 items-center justify-between w-full">
      <span className="subtitle3 text-secondary-text whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center">
        <span className="body3">
          {dueAt
            ? formatDateTimeWithOrdinalIndicator(
                convertUTCStringToLocalDateTime(dueAt)
              )
            : noneText}
        </span>
      </div>
    </div>
  );
};

export default TaskClosingDateField;
