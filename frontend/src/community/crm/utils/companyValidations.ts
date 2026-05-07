import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";

type TranslatorFunctionType = (suffixes: string[]) => string;

export const addCompanyValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .required(translator(["name"]))
      .max(
        characterLengths.COMPANY_NAME_LENGTH,
        `Maximum ${characterLengths.COMPANY_NAME_LENGTH} characters allowed`
      ),
    contactNumber: Yup.string()
      .nullable()
      .optional()
      .max(
        characterLengths.PHONE_NUMBER_LENGTH_MAX,
        `Maximum ${characterLengths.PHONE_NUMBER_LENGTH_MAX} characters allowed`
      ),
    website: Yup.string()
      .nullable()
      .optional()
      .url(translator(["website"]))
      .max(
        characterLengths.CHARACTER_LENGTH,
        `Maximum ${characterLengths.CHARACTER_LENGTH} characters allowed`
      ),
    address: Yup.string()
      .nullable()
      .optional()
      .max(
        characterLengths.ADDRESS_LENGTH,
        `Maximum ${characterLengths.ADDRESS_LENGTH} characters allowed`
      ),
    industry: Yup.string()
      .nullable()
      .optional()
      .max(
        characterLengths.CHARACTER_LENGTH,
        `Maximum ${characterLengths.CHARACTER_LENGTH} characters allowed`
      )
  });
