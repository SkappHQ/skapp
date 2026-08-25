import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { isDealStageNameValid } from "~community/crm/v2/regex/crmRegexPatterns";
import { CrmStageEntity } from "~community/crm/v2/types/CrmCommonTypes";

export const getStageValidationSchema = (
  translator: TranslatorFunctionType,
  stages: CrmStageEntity[],
  currentStageId?: number
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["dealStageModal", "validations", "nameRequired"]))
      .min(
        characterLengths.DEAL_STAGE_NAME_MIN_LENGTH,
        translator(["dealStageModal", "validations", "nameInvalid"])
      )
      .max(
        characterLengths.DEAL_STAGE_NAME_LENGTH,
        translator(["dealStageModal", "validations", "nameLength"])
      )
      .matches(
        isDealStageNameValid(),
        translator(["dealStageModal", "validations", "nameInvalid"])
      )
      .test(
        "is-deal-stage-name-unique",
        translator(["dealStageModal", "validations", "nameExists"]),
        (value) =>
          stages.every(
            (stage) =>
              stage.id === currentStageId ||
              stage.name?.trim().toLowerCase() !== value.trim().toLowerCase()
          )
      ),
    description: Yup.string()
      .trim()
      .optional()
      .max(
        characterLengths.DEAL_STAGE_DESCRIPTION_LENGTH,
        translator(["dealStageModal", "validations", "descriptionLength"])
      )
  });
