import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { isValidPhoneNumber } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { isValidCompanyWebsiteUrl } from "~community/crm/v2/regex/crmRegexPatterns";

export const getCompanyValidationSchema = (
  translator: TranslatorFunctionType
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["companies", "modal", "validations", "name"]))
      .max(
        characterLengths.COMPANY_NAME_LENGTH,
        translator(["companies", "modal", "validations", "companyNameLength"])
      ),
    contactNumber: Yup.string()
      .nullable()
      .optional()
      .test(
        "valid-contact-number",
        translator(["companies", "modal", "validations", "contactNumber"]),
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
      .matches(
        isValidCompanyWebsiteUrl(),
        translator(["companies", "modal", "validations", "website"])
      )
      .max(
        characterLengths.CHARACTER_LENGTH,
        translator(["companies", "modal", "validations", "characterLength"])
      ),
    address: Yup.string()
      .nullable()
      .optional()
      .max(
        characterLengths.ADDRESS_LENGTH,
        translator(["companies", "modal", "validations", "addressLength"])
      )
  });
