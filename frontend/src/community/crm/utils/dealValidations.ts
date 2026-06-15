import * as Yup from "yup";

import { isPositiveNumber } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";

export const addDealValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["validations", "dealNameRequired"])),
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
      (value) =>
        !value || (isPositiveNumber().test(value) && Number(value) > 0)
    )
  });
