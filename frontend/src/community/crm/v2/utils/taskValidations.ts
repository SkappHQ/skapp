import {
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
  startOfToday
} from "date-fns";

export const isOverdue = (dueAt: string): boolean =>
  isBefore(parseISO(dueAt), startOfToday());

export const isDueToday = (dueAt: string): boolean => isToday(parseISO(dueAt));

export const isDueTomorrow = (dueAt: string): boolean =>
  isTomorrow(parseISO(dueAt));
