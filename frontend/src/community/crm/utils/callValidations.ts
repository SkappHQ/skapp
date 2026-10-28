import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const getCallValidationSchema = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    subject: Yup.string()
      .trim()
      .required(
        translator(["activities", "logCall", "modal", "validations", "subject"])
      ),
    duration: Yup.string().matches(
      /^\d*$/,
      translator(["activities", "logCall", "modal", "validations", "duration"])
    ),
    contactId: Yup.number()
      .nullable()
      .required(
        translator(["activities", "logCall", "modal", "validations", "contact"])
      ),
    ownerId: Yup.number()
      .nullable()
      .required(
        translator(["activities", "logCall", "modal", "validations", "owner"])
      )
  });
