import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const getActivitySubjectValidation = (
  translator: TranslatorFunctionType
) =>
  Yup.string()
    .trim()
    .required(
      translator(["activities", "logActivity", "validations", "subject"])
    );

export const getActivityOwnerValidation = (
  translator: TranslatorFunctionType
) =>
  Yup.number()
    .nullable()
    .required(
      translator(["activities", "logActivity", "validations", "owner"])
    );
