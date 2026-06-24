import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const dealStageValidations = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translator(["dealStageModal", "validations", "nameRequired"]))
      .max(
        characterLengths.DEAL_STAGE_NAME_LENGTH,
        translator(["dealStageModal", "validations", "nameLength"])
      ),
    description: Yup.string()
      .trim()
      .optional()
      .max(
        characterLengths.DEAL_STAGE_DESCRIPTION_LENGTH,
        translator(["dealStageModal", "validations", "descriptionLength"])
      )
  });
