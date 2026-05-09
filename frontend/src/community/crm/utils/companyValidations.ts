import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";

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
      .min(
        characterLengths.PHONE_NUMBER_LENGTH_MIN,
        translator(["contactNumberMin"])
      )
      .max(
        characterLengths.PHONE_NUMBER_LENGTH_MAX,
        translator(["contactNumberMax"])
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
