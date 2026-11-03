import * as Yup from "yup";

import { isValidEmail } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { getActivitySubjectValidation } from "~community/crm/activities/utils/activityValidations";

export const getEmailValidationSchema = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    fromAddress: Yup.string()
      .trim()
      .matches(isValidEmail(), {
        message: translator([
          "contacts",
          "modal",
          "validations",
          "invalidEmail"
        ]),
        excludeEmptyString: true
      }),
    date: Yup.string()
      .nullable()
      .required(
        translator([
          "activities",
          "logEmail",
          "modal",
          "validations",
          "dateTime"
        ])
      ),
    time: Yup.string().required(
      translator(["activities", "logEmail", "modal", "validations", "dateTime"])
    ),
    toContactIds: Yup.array()
      .of(Yup.number())
      .min(
        1,
        translator(["activities", "logEmail", "modal", "validations", "to"])
      ),
    subject: getActivitySubjectValidation(translator)
  });
