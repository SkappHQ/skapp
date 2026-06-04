import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import {
  isValidEmail,
  isValidPhoneNumber
} from "~community/common/regex/regexPatterns";

type TranslatorFunctionType = (suffixes: string[]) => string;

export const editContactValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["validations", "name"]))
      .max(
        characterLengths.NAME_LENGTH,
        translator(["validations", "nameLength"])
      ),
    email: Yup.string()
      .trim()
      .required(translator(["validations", "email"]))
      .matches(isValidEmail(), translator(["validations", "invalidEmail"]))
      .max(
        characterLengths.CHARACTER_LENGTH,
        translator(["validations", "characterLength"])
      ),
    contactNumber: Yup.string()
      .nullable()
      .optional()
      .trim()
      .max(
        characterLengths.PHONE_NUMBER_LENGTH_MAX,
        translator(["validations", "contactNumberLength"])
      )
      .test(
        "valid-contact-number",
        translator(["validations", "contactNumber"]),
        function (inputContactNumber) {
          if (!inputContactNumber) {
            return true;
          }

          return isValidPhoneNumber().test(inputContactNumber);
        }
      ),
    companyId: Yup.number().nullable().optional(),
    ownerId: Yup.number().nullable().optional()
  });
