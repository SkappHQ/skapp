import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  DEAL_DESCRIPTION_MAX_LENGTH,
  DEAL_NAME_MAX_LENGTH
} from "~community/crm/constants/dealConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { isDealNameValid } from "~community/crm/regex/crmRegexPatterns";

export const dealNameValidation = (translator: TranslatorFunctionType) =>
  Yup.string()
    .trim()
    .max(DEAL_NAME_MAX_LENGTH, translator(["validations", "dealNameMaxLength"]))
    .matches(
      isDealNameValid(),
      translator(["validations", "dealNameInvalidChars"])
    )
    .required(translator(["validations", "dealNameRequired"]));

export const dealTitleValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: dealNameValidation(translator)
  });

export const inlineAddDealValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(
        translator(["inlineAddDeal", "validations", "dealNameRequired"])
      )
      .max(DEAL_NAME_MAX_LENGTH)
      .matches(
        isDealNameValid(),
        translator(["inlineAddDeal", "validations", "dealNameInvalidChars"])
      ),
    contactId: Yup.string().required()
  });

export const addDealValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: dealNameValidation(translator),
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
