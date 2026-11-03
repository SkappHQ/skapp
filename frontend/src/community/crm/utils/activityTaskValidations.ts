import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { getActivityOwnerValidation } from "~community/crm/activities/utils/activityValidations";

export const getActivityTaskValidationSchema = (
  translator: TranslatorFunctionType
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(
        translator(["activities", "addTask", "modal", "validations", "name"])
      )
      .max(
        characterLengths.TASK_NAME_LENGTH,
        translator(["tasks", "modal", "validations", "nameLength"])
      ),
    priority: Yup.string()
      .nullable()
      .required(
        translator([
          "activities",
          "addTask",
          "modal",
          "validations",
          "priority"
        ])
      ),
    dueAt: Yup.string()
      .nullable()
      .required(translator(["tasks", "modal", "validations", "dueDate"])),
    ownerId: getActivityOwnerValidation(translator),
    notes: Yup.string().max(
      characterLengths.TASK_NOTES_LENGTH,
      translator(["tasks", "modal", "validations", "notesLength"])
    )
  });
