import * as Yup from "yup";

import { callDurationPattern } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const getCallValidationSchema = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    subject: Yup.string()
      .trim()
      .required(
        translator(["activities", "logCall", "modal", "validations", "subject"])
      ),
    duration: Yup.string()
      .trim()
      .matches(callDurationPattern(), {
        message: translator([
          "activities",
          "logCall",
          "modal",
          "validations",
          "duration"
        ]),
        excludeEmptyString: true
      }),
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
