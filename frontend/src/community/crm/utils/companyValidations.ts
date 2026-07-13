import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import {
  isValidCompanyWebsiteUrl,
  isValidCrmPhoneNumber
} from "~community/crm/regex/crmRegexPatterns";

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

          return isValidCrmPhoneNumber().test(inputContactNumber);
        }
      ),
    website: Yup.string()
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v))
      .matches(isValidCompanyWebsiteUrl(), translator(["validations", "website"]))
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
