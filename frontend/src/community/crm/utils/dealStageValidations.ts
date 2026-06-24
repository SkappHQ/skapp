import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

export const dealStageValidations = (
  translator: TranslatorFunctionType,
  dealStages: CrmDealStageType[] = [],
  currentStageId?: number
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["dealStageModal", "validations", "nameRequired"]))
      .max(
        characterLengths.DEAL_STAGE_NAME_LENGTH,
        translator(["dealStageModal", "validations", "nameLength"])
      )
      .test(
        "is-deal-stage-name-unique",
        translator(["dealStageModal", "validations", "nameExists"]),
        (value) => {
          if (!value) return true;

          return dealStages.every(
            (stage) =>
              stage.id === currentStageId ||
              stage.name.trim().toLowerCase() !== value.trim().toLowerCase()
          );
        }
      ),
    description: Yup.string()
      .trim()
      .optional()
      .max(
        characterLengths.DEAL_STAGE_DESCRIPTION_LENGTH,
        translator(["dealStageModal", "validations", "descriptionLength"])
      )
  });
