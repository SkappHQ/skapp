import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  formatDateTimeWithOrdinalIndicator,
  instantInZone,
  instantToPickedDay,
  pickedDayToInstant
} from "~community/common/utils/dateTimeUtils";
import { ACTIVITY_PRIORITY_KEYS } from "~community/crm/activities/constants/activityConstants";
import { ActivityTaskDetail } from "~community/crm/activities/types/activityTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";

const VALIDATION_KEYS = ["activities", "taskPanel", "validations"];

export const validateActivityTaskName = (
  value: string,
  translate: TranslatorFunctionType
): string => {
  const trimmed = value.trim();

  if (!trimmed) return translate([...VALIDATION_KEYS, "nameRequired"]);

  if (trimmed.length > characterLengths.TASK_NAME_LENGTH) {
    return translate([...VALIDATION_KEYS, "nameLength"]);
  }

  return "";
};

export const validateActivityTaskNotes = (
  value: string,
  translate: TranslatorFunctionType
): string =>
  value.trim().length > characterLengths.TASK_NOTES_LENGTH
    ? translate([...VALIDATION_KEYS, "notesLength"])
    : "";

export const formatTaskDueDate = (dueAt: string, zone?: string): string =>
  formatDateTimeWithOrdinalIndicator(instantInZone(dueAt, zone));

export const toTaskDueAt = (pickedDay: Date, zone?: string): string | null =>
  pickedDayToInstant(pickedDay, zone);

export const toTaskDueDay = (dueAt: string, zone?: string): Date =>
  instantToPickedDay(dueAt, zone);

export const getTaskPriorityKey = (priority: CrmPriorityEnum | null): string =>
  ACTIVITY_PRIORITY_KEYS[priority ?? CrmPriorityEnum.LOW];

export const canReopenTask = (task: ActivityTaskDetail): boolean =>
  task.isCompleted && task.canComplete;

export const canMarkTaskAsDone = (task: ActivityTaskDetail): boolean =>
  !task.isCompleted && task.canComplete;
