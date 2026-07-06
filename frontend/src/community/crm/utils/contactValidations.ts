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
      .required(translator(["validations", "name"]))
      .max(CONTACT_NAME_MAX_LENGTH, translator(["validations", "nameLength"]))
      .matches(isContactNameValid(), {
        message: translator(["validations", "nameInvalidCharacters"]),
        excludeEmptyString: true
      }),
    email: Yup.string()
      .test(
        "email-required",
        translator(["validations", "email"]),
        (inputEmail) => Boolean(inputEmail?.trim())
      )
      .test(
        "email-format",
        translator(["validations", "invalidEmail"]),
        (inputEmail) =>
          !inputEmail?.trim() || isValidEmail().test(inputEmail.trim())
      )
      .test(
        "email-max-length",
        translator(["validations", "invalidEmail"]),
        (inputEmail) =>
          !inputEmail || inputEmail.length <= CONTACT_EMAIL_MAX_LENGTH
      ),
    contactNumber: Yup.string()
      .nullable()
      .optional()
      .test(
        "valid-contact-number",
        translator(["validations", "contactNumber"]),
        function (inputContactNumber) {
          if (!inputContactNumber || inputContactNumber === "") {
            return true;
          }

          return isValidPhoneNumber().test(inputContactNumber);
        }
      ),
    companyId: Yup.number().nullable().optional(),
    ownerId: Yup.number()
      .nullable()
      .required(translator(["validations", "owner"]))
  });
