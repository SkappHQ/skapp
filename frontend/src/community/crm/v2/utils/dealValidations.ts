import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  DEAL_DESCRIPTION_MAX_LENGTH,
  DEAL_NAME_MAX_LENGTH
} from "~community/crm/constants/dealConstants";
import { isDealNameValid } from "~community/crm/regex/crmRegexPatterns";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";

export const dealNameValidation = (translator: TranslatorFunctionType) =>
  Yup.string()
    .trim()
    .max(DEAL_NAME_MAX_LENGTH, translator(["validations", "dealNameMaxLength"]))
    .matches(
      isDealNameValid(),
      translator(["validations", "dealNameInvalidChars"])
    )
    .required(translator(["validations", "dealNameRequired"]));

export const addDealValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: dealNameValidation(translator),
    stageId: Yup.number().required(
      translator(["validations", "stageRequired"])
    ),
    contactId: Yup.number().required(
      translator(["validations", "contactRequired"])
    ),
    ownerId: Yup.number().required(
      translator(["validations", "ownerRequired"])
    ),
    priority: Yup.mixed<CrmPriorityEnum>()
      .required(translator(["validations", "priorityRequired"]))
      .oneOf(Object.values(CrmPriorityEnum)),
    amount: Yup.string().test(
      "is-valid-amount",
      translator(["validations", "amountInvalid"]),
      (value) => !value || Number(value) > 0
    ),
    description: Yup.string().max(
      DEAL_DESCRIPTION_MAX_LENGTH,
      translator(["validations", "descriptionMaxLength"])
    )
  });

const validateField = (
  fieldName: string,
  value: unknown,
  translator: TranslatorFunctionType
): string => {
  try {
    (
      Yup.reach(addDealValidations(translator), fieldName) as Yup.AnySchema
    ).validateSync(value);
    return "";
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message;
    }
    throw error;
  }
};

export const validateDealAmount = (
  amount: string,
  translator: TranslatorFunctionType
): string => validateField("amount", amount, translator);

export const validateDealName = (
  name: string,
  translator: TranslatorFunctionType
): string => validateField("name", name, translator);

export const validateDealDescription = (
  description: string,
  translator: TranslatorFunctionType
): string => validateField("description", description, translator);
