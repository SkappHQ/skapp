import { CalendarIcon, DatePicker } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  formatTaskDueDate,
  toTaskDueAt,
  toTaskDueDay
} from "~community/crm/activities/utils/activityTaskUtil";

interface ActivityTaskDueDateFieldProps {
  id: string;
  dueAt: string | null;
  isEditable: boolean;
  timeZone?: string;
  onSave: (dueAt: string) => void;
}

const ActivityTaskDueDateField: FC<ActivityTaskDueDateFieldProps> = ({
  id,
  dueAt,
  isEditable,
  timeZone,
  onSave
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const displayText = dueAt
    ? formatTaskDueDate(dueAt, timeZone)
    : translateText(["activities", "taskPanel", "info", "noDueDate"]);

  if (!isEditable) {
    return (
      <span id={id} className="body2">
        {displayText}
      </span>
    );
  }

  const handleSelect = (date?: Date) => {
    if (!date) return;

    const nextDueAt = toTaskDueAt(date, timeZone);

    if (nextDueAt && nextDueAt !== dueAt) onSave(nextDueAt);
  };

  return (
    <DatePicker
      mode="single"
      {...(dueAt ? { selected: toTaskDueDay(dueAt, timeZone) } : {})}
      onSelect={handleSelect}
      popperProps={{ position: "bottom-end", isFlip: true }}
    >
      <button
        id={id}
        type="button"
        aria-label={translateAria(["activities", "taskPanel", "dueDate"], {
          date: displayText
        })}
        className="w-full min-h-8 px-3 rounded-lg flex items-center justify-between gap-2 body2 cursor-pointer hover:bg-secondary-background"
      >
        <span className="truncate">{displayText}</span>
        <CalendarIcon aria-hidden="true" />
      </button>
    </DatePicker>
  );
};

export default ActivityTaskDueDateField;
