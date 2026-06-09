import { format, isBefore, isToday, parseISO, startOfDay } from "date-fns";

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

  const due = startOfDay(parseISO(dueAt));

  if (!isCompleted && isBefore(due, startOfDay(new Date()))) {
    return { textKey: "dueDateOverdue", colorClass: "text-semantic-red-text" };
  }

  if (!isCompleted && isToday(due)) {
    return { textKey: "dueDateToday", colorClass: "text-semantic-amber-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: format(due, "do LLL"),
    colorClass: "text-secondary-text"
  };
};
