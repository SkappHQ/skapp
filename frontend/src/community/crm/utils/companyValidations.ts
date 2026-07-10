import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { isValidPhoneNumber } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmIndustryEnum } from "~community/crm/enums/common";

export function isValidCompanyWebsiteUrl(): RegExp {
  return /^(https:\/\/)?(www\.)?[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63}){0,9}\.[a-z]{2,63}(\/[^\s?#]*)?$/i;
}

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
      .matches(isValidCompanyWebsiteUrl(), {
        message: translator(["validations", "website"]),
        excludeEmptyString: true
      })
      .max(
        characterLengths.CHARACTER_LENGTH,
        translator(["validations", "characterLength"])
      ),
    address: Yup.string()
      .nullable()
      .optional()
      .max(
        characterLengths.ADDRESS_LENGTH,
        translator(["validations", "addressLength"])
      ),
    industry: Yup.mixed<CrmIndustryEnum>()
      .optional()
      .oneOf(
        Object.values(CrmIndustryEnum),
        translator(["validations", "industry"])
      )
  });
