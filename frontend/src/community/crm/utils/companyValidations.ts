import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { isValidPhoneNumber } from "~community/common/regex/regexPatterns";

type TranslatorFunctionType = (suffixes: string[]) => string;

export const addCompanyValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["validations", "name"]))
      .max(
        characterLengths.COMPANY_NAME_LENGTH,
        translator(["validations", "companyNameLength"])
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
    website: Yup.string()
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v))
      .url(translator(["validations", "website"]))
      .max(characterLengths.CHARACTER_LENGTH, translator(["validations", "characterLength"])),
    address: Yup.string()
      .nullable()
      .optional()
      .max(characterLengths.ADDRESS_LENGTH, translator(["validations", "addressLength"])),
    industry: Yup.string()
      .nullable()
      .optional()
      .max(characterLengths.CHARACTER_LENGTH, translator(["validations", "characterLength"]))
  });
