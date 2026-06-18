import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { isDealNameValid } from "~community/crm/regex/crmRegexPatterns";

export const addDealValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["validations", "dealNameRequired"]))
      .max(255, translator(["validations", "dealNameMaxLength"]))
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
    )
  });
