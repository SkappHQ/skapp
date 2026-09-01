import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const getTaskValidationSchema = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["validations", "name"]))
      .max(
        characterLengths.TASK_NAME_LENGTH,
        translator(["validations", "nameLength"])
      ),
    typeId: Yup.number().required(translator(["validations", "type"])),
    ownerId: Yup.number().required(translator(["validations", "owner"])),
    dueAt: Yup.string().required(translator(["validations", "dueDate"])),
    notes: Yup.string().max(
      characterLengths.TASK_NOTES_LENGTH,
      translator(["validations", "notesLength"])
    )
  });
