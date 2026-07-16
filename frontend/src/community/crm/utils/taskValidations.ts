import {
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
  startOfToday
} from "date-fns";
import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const isOverdue = (dueAt: string): boolean =>
  isBefore(parseISO(dueAt), startOfToday());

export const isDueToday = (dueAt: string): boolean => isToday(parseISO(dueAt));

export const isDueTomorrow = (dueAt: string): boolean =>
  isTomorrow(parseISO(dueAt));

const baseTaskValidations = (translator: TranslatorFunctionType) =>({
    type: Yup.object()
      .nullable()
      .required(translator(["validations", "type"])),
    name: Yup.string()
      .trim()
      .required(translator(["validations", "name"]))
      .max(
        characterLengths.TASK_NAME_LENGTH,
        translator(["validations", "nameLength"])
      ),
    notes: Yup.string()
      .nullable()
      .max(
        characterLengths.TASK_NOTES_LENGTH,
        translator(["validations", "notesLength"])
      ),
    owner: Yup.number()
      .nullable()
      .required(translator(["validations", "owner"]))
  });

export const addTaskValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    ...baseTaskValidations(translator),
    dueDate: Yup.date()
      .nullable()
      .required(translator(["validations", "dueDate"]))
  });

export const editTaskValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    ...baseTaskValidations(translator),
    dueDate: Yup.date()
      .nullable()
      .required(translator(["validations", "dueDate"])),
  });
