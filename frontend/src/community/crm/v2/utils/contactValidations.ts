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
      .max(
        CONTACT_NAME_MAX_LENGTH,
        translator(["contacts", "modal", "validations", "nameLength"])
      )
      .matches(isContactNameValid(), {
        message: translator([
          "contacts",
          "modal",
          "validations",
          "nameInvalidCharacters"
        ]),
        excludeEmptyString: true
      })
      .required(translator(["contacts", "modal", "validations", "name"])),
    email: Yup.string()
      .trim()
      .max(
        CONTACT_EMAIL_MAX_LENGTH,
        translator(["contacts", "modal", "validations", "emailLength"])
      )
      .matches(isValidEmail(), {
        message: translator([
          "contacts",
          "modal",
          "validations",
          "invalidEmail"
        ])
      })
      .required(translator(["contacts", "modal", "validations", "email"])),
    contactNumber: Yup.string()
      .trim()
      .nullable()
      .optional()
      .matches(isValidPhoneNumber(), {
        message: translator([
          "contacts",
          "modal",
          "validations",
          "contactNumber"
        ]),
        excludeEmptyString: true
      }),
    companyId: Yup.number().nullable().optional(),
    ownerId: Yup.number()
      .nullable()
      .required(translator(["contacts", "modal", "validations", "owner"]))
  });
