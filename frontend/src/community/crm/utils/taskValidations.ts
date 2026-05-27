import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const addTaskValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    type: Yup.string()
      .nullable()
      .required(translator(["validations", "type"])),
    name: Yup.string()
      .trim()
      .required(translator(["validations", "name"])),
    dueDate: Yup.string()
      .nullable()
      .required(translator(["validations", "dueDate"]))
      .test(
        "not-backdated",
        translator(["validations", "dueDatePast"]),
        (value) => {
          if (!value) {
            return true;
          }

          const selectedDate = new Date(value);

          if (Number.isNaN(selectedDate.getTime())) {
            return false;
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return selectedDate >= today;
        }
      )
  });
