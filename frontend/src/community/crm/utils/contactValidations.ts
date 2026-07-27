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
    firstName: Yup.string()
      .trim()
      .max(
        CONTACT_NAME_MAX_LENGTH,
        translator(["validations", "firstNameLength"])
      )
      .matches(isContactNameValid(), {
        message: translator(["validations", "firstNameInvalidCharacters"]),
        excludeEmptyString: true
      })
      .required(translator(["validations", "firstName"])),
    lastName: Yup.string()
      .trim()
      .nullable()
      .optional()
      .max(
        CONTACT_NAME_MAX_LENGTH,
        translator(["validations", "lastNameLength"])
      )
      .matches(isContactNameValid(), {
        message: translator(["validations", "lastNameInvalidCharacters"]),
        excludeEmptyString: true
      }),
    email: Yup.string()
      .trim()
      .max(CONTACT_EMAIL_MAX_LENGTH, translator(["validations", "emailLength"]))
      .matches(isValidEmail(), {
        message: translator(["validations", "invalidEmail"])
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
