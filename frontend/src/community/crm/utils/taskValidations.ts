import { isAfter, isToday, startOfDay } from "date-fns";
import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const addTaskValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    type: Yup.object()
      .nullable()
      .required(translator(["validations", "type"])),
    name: Yup.string()
      .trim()
      .required(translator(["validations", "name"]))
      .max(
        characterLengths.NAME_LENGTH,
        translator(["validations", "nameLength"])
      ),
    notes: Yup.string()
      .nullable()
      .max(
        characterLengths.TASK_NOTES_LENGTH,
        translator(["validations", "notesLength"])
      ),
    dueDate: Yup.date()
      .nullable()
      .required(translator(["validations", "dueDate"]))
      .test(
        "not-backdated",
        translator(["validations", "dueDatePast"]),
        function (value) {
          if (!value) return true;
          return (
            isToday(value) || isAfter(startOfDay(value), startOfDay(new Date()))
          );
        }
      ),
    owner: Yup.number()
      .nullable()
      .required(translator(["validations", "owner"]))
  });
