import { DateTime } from "luxon";

import { getOrdinalIndicator } from "~community/common/utils/dateTimeUtils";

export interface DueDateDisplay {
  textKey: string;
  dateValue?: string;
  colorClass: string;
}

export const getDueDateDisplay = (
  dueAt: string | null,
  isCompleted: boolean
): DueDateDisplay | null => {
  if (!dueAt) return null;

  const due = DateTime.fromISO(dueAt).startOf("day");
  const today = DateTime.now().startOf("day");

  if (!isCompleted && due < today) {
    return { textKey: "dueDateOverdue", colorClass: "text-semantic-red-text" };
  }

  if (!isCompleted && due.equals(today)) {
    return { textKey: "dueDateToday", colorClass: "text-semantic-amber-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: `${due.day}${getOrdinalIndicator(due.day)} ${due.toFormat("LLL")}`,
    colorClass: "text-secondary-text"
  };
};
