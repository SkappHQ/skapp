import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  DEAL_DESCRIPTION_MAX_LENGTH,
  DEAL_NAME_MAX_LENGTH
} from "~community/crm/constants/dealConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { isDealNameValid } from "~community/crm/regex/crmRegexPatterns";

// Field-level validators shared by the inline edit flow (DealSidePanel).
// They reuse the same constants and regex as addDealValidations so the two
// flows enforce an identical set of rules.
export const validateDealName = (
  name: string,
  translator: TranslatorFunctionType
): string | undefined => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return translator(["validations", "dealNameRequired"]);
  }
  if (trimmedName.length > DEAL_NAME_MAX_LENGTH) {
    return translator(["validations", "dealNameMaxLength"]);
  }
  if (!isDealNameValid().test(trimmedName)) {
    return translator(["validations", "dealNameInvalidChars"]);
  }
  return undefined;
};

export const validateDealDescription = (
  description: string,
  translator: TranslatorFunctionType
): string | undefined => {
  if (description.length > DEAL_DESCRIPTION_MAX_LENGTH) {
    return translator(["validations", "descriptionMaxLength"]);
  }
  return undefined;
};

export const validateDealAmount = (
  amount: string,
  translator: TranslatorFunctionType
): string | undefined => {
  if (amount && !(Number(amount) > 0)) {
    return translator(["validations", "amountInvalid"]);
  }
  return undefined;
};

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
