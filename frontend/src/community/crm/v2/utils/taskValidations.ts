import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const taskValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["validations", "name"]))
      .max(
        characterLengths.TASK_NAME_LENGTH,
        translator(["validations", "nameLength"])
      ),
    typeId: Yup.number()
      .nullable()
      .required(translator(["validations", "type"])),
    dueAt: Yup.string()
      .nullable()
      .required(translator(["validations", "dueDate"])),
    ownerId: Yup.number()
      .nullable()
      .required(translator(["validations", "owner"])),
    notes: Yup.string()
      .nullable()
      .max(
        characterLengths.TASK_NOTES_LENGTH,
        translator(["validations", "notesLength"])
      )
  });
