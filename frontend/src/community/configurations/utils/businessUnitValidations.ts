import * as Yup from "yup";

import { BusinessUnit } from "~community/common/types/BusinessUnitTypes";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const BUSINESS_UNIT_NAME_MAX_LENGTH = 100;
export const BUSINESS_UNIT_DESCRIPTION_MAX_LENGTH = 250;

export const businessUnitValidation = (
  translateText: TranslatorFunctionType,
  businessUnits: BusinessUnit[] = [],
  currentBusinessUnitId?: number
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(translateText(["validations", "nameRequired"]))
      .max(
        BUSINESS_UNIT_NAME_MAX_LENGTH,
        translateText(["validations", "nameTooLong"])
      )
      .test(
        "name-unique",
        translateText(["validations", "nameExists"]),
        (value) => {
          if (!value) return true;

          return businessUnits.every(
            (businessUnit) =>
              businessUnit.businessUnitId === currentBusinessUnitId ||
              businessUnit.name.trim() !== value
          );
        }
      ),
    description: Yup.string()
      .trim()
      .max(
        BUSINESS_UNIT_DESCRIPTION_MAX_LENGTH,
        translateText(["validations", "descriptionTooLong"])
      )
  });
