import * as Yup from "yup";

import {
  isValidEmail,
  isValidPhoneNumber
} from "~community/common/regex/regexPatterns";
import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH
} from "~community/crm/constants/contactConstants";
import { isContactNameValid } from "~community/crm/regex/crmRegexPatterns";

type TranslatorFunctionType = (suffixes: string[]) => string;

export const addContactValidations = (translator: TranslatorFunctionType) =>
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
        message: translator(["validations", "invalidEmail"]),
        excludeEmptyString: true
      })
      .required(translator(["validations", "email"])),
    contactNumber: Yup.string()
      .trim()
      .nullable()
      .optional()
      .matches(isValidPhoneNumber(), {
        message: translator(["validations", "contactNumber"]),
        excludeEmptyString: true
      }),
    companyId: Yup.number().nullable().optional(),
    ownerId: Yup.number()
      .nullable()
      .required(translator(["validations", "owner"]))
  });
