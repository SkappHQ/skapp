import * as Yup from "yup";

type TranslatorFunctionType = (suffixes: string[]) => string;

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
  });
