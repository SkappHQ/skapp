import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { isValidPhoneNumber } from "~community/common/regex/regexPatterns";

type TranslatorFunctionType = (suffixes: string[]) => string;

export const addCompanyValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .required(translator(["name"]))
      .max(
        characterLengths.COMPANY_NAME_LENGTH,
        translator(["companyNameLength"])
      ),
    contactNumber: Yup.string()
      .nullable()
      .optional()
      .test(
        "valid-contact-number",
        translator(["contactNumber"]),
        function (inputContactNumber) {
          if (!inputContactNumber || inputContactNumber === "") {
            return true;
          }
          const { countryCode } = this.parent;

          const phoneNumber = countryCode + inputContactNumber;

          return isValidPhoneNumber().test(phoneNumber);
        }
      ),
    website: Yup.string()
      .nullable()
      .optional()
      .url(translator(["website"]))
      .max(characterLengths.CHARACTER_LENGTH, translator(["characterLength"])),
    address: Yup.string()
      .nullable()
      .optional()
      .max(characterLengths.ADDRESS_LENGTH, translator(["addressLength"])),
    industry: Yup.string()
      .nullable()
      .optional()
      .max(characterLengths.CHARACTER_LENGTH, translator(["characterLength"]))
  });
