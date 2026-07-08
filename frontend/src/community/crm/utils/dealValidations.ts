import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  DEAL_DESCRIPTION_MAX_LENGTH,
  DEAL_NAME_MAX_LENGTH
} from "~community/crm/constants/dealConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { isDealNameValid } from "~community/crm/regex/crmRegexPatterns";

export const addDealValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["validations", "dealNameRequired"]))
      .max(
        DEAL_NAME_MAX_LENGTH,
        translator(["validations", "dealNameMaxLength"])
      )
      .matches(
        isDealNameValid(),
        translator(["validations", "dealNameInvalidChars"])
      ),
    stageId: Yup.string().required(
      translator(["validations", "stageRequired"])
    ),
    contactId: Yup.string().required(
      translator(["validations", "contactRequired"])
    ),
    ownerId: Yup.string().required(
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

export const validateDealName = (
  name: string,
  translator: TranslatorFunctionType
): string => validateField("name", name, translator);

export const validateDealDescription = (
  description: string,
  translator: TranslatorFunctionType
): string => validateField("description", description, translator);

export const validateDealAmount = (
  amount: string,
  translator: TranslatorFunctionType
): string => validateField("amount", amount, translator);
