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
      .required(translateText(["validations", "nameRequired"]))
      .test(
        "name-not-blank",
        translateText(["validations", "nameRequired"]),
        (value) => !!value && value.trim().length > 0
      )
      .max(
        BUSINESS_UNIT_NAME_MAX_LENGTH,
        translateText(["validations", "nameTooLong"])
      )
      .test(
        "name-unique",
        translateText(["validations", "nameExists"]),
        (value) => {
          if (!value) return true;

          const trimmedName = value.trim();
          return businessUnits.every(
            (businessUnit) =>
              businessUnit.businessUnitId === currentBusinessUnitId ||
              businessUnit.name.trim() !== trimmedName
          );
        }
      ),
    description: Yup.string().max(
      BUSINESS_UNIT_DESCRIPTION_MAX_LENGTH,
      translateText(["validations", "descriptionTooLong"])
    )
  });
