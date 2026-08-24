import * as Yup from "yup";

import {
  isValidEmail,
  isValidPhoneNumber
} from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH
} from "~community/crm/v2/constants/contactConstants";
import { isContactNameValid } from "~community/crm/v2/regex/crmRegexPatterns";

export const getContactValidationSchema = (
  translator: TranslatorFunctionType
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(CONTACT_NAME_MAX_LENGTH, translator(["validations", "nameLength"]))
      .matches(isContactNameValid(), {
        message: translator(["validations", "nameInvalidCharacters"]),
        excludeEmptyString: true
      })
      .required(translator(["validations", "name"])),
    email: Yup.string()
      .trim()
      .max(CONTACT_EMAIL_MAX_LENGTH, translator(["validations", "emailLength"]))
      .matches(isValidEmail(), {
        message: translator(["validations", "invalidEmail"])
      })
      .required(translator(["validations", "email"])),
    contactNumber: Yup.string()
      .trim()
      .optional()
      .matches(isValidPhoneNumber(), {
        message: translator(["validations", "contactNumber"]),
        excludeEmptyString: true
      }),
    companyId: Yup.number().optional(),
    ownerId: Yup.number().required(translator(["validations", "owner"]))
  });
