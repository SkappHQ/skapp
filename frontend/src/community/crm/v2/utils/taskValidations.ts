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

export const getTaskValidationSchema = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["tasks", "modal", "validations", "name"]))
      .max(
        characterLengths.TASK_NAME_LENGTH,
        translator(["tasks", "modal", "validations", "nameLength"])
      ),
    typeId: Yup.number().required(
      translator(["tasks", "modal", "validations", "type"])
    ),
    dueAt: Yup.string().required(
      translator(["tasks", "modal", "validations", "dueDate"])
    ),
    ownerId: Yup.number().required(
      translator(["tasks", "modal", "validations", "owner"])
    ),
    notes: Yup.string().max(
      characterLengths.TASK_NOTES_LENGTH,
      translator(["tasks", "modal", "validations", "notesLength"])
    )
  });

export const isOverdue = (dueAt: string): boolean =>
  isBefore(parseISO(dueAt), startOfToday());

export const isDueToday = (dueAt: string): boolean => isToday(parseISO(dueAt));

export const isDueTomorrow = (dueAt: string): boolean =>
  isTomorrow(parseISO(dueAt));
