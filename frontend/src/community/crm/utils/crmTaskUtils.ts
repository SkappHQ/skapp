import { DateTime } from "luxon";

export interface DueDateDisplay {
  textKey: string;
  dateValue?: string;
  colorClass: string;
}

export const getDueDateDisplay = (
  dueAt: string | null,
  isCompleted: boolean
): DueDateDisplay => {
  if (!dueAt) return { textKey: "dueDateNoDate", colorClass: "text-gray-400" };

  const parsedDue = DateTime.fromISO(dueAt);
  if (!parsedDue.isValid)
    return { textKey: "dueDateNoDate", colorClass: "text-gray-400" };

  const due = parsedDue.startOf("day");
  const today = DateTime.now().startOf("day");

  if (!isCompleted && due < today) {
    return { textKey: "dueDateOverdue", colorClass: "text-semantic-red-text" };
  }

  if (!isCompleted && due.equals(today)) {
    return { textKey: "dueDateToday", colorClass: "text-semantic-amber-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: due.toLocaleString({ month: "short", day: "numeric" }),
    colorClass: "text-gray-600"
  };
};
