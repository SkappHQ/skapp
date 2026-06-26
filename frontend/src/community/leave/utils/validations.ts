import * as Yup from "yup";

import { allowsOnlyNumbersAndOptionalDecimal } from "~community/common/regex/regexPatterns";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";

type TranslatorFunctionType = (
  suffixes: string[],
  interpolationValues?: Record<string, string>
) => string;

export const customLeaveAllocationValidation = (
  translateText: TranslatorFunctionType
) =>
  Yup.object({
    name: Yup.string()
      .required(translateText(["leaveAllocationNameError"]))
      .max(100, translateText(["leaveAllocationNameMaxLengthError"])),
    numberOfDays: Yup.number()
      .required(translateText(["requireNoOfDaysError"]))
      .min(0.5, translateText(["validNoOfDaysRangeError"]))
      .max(365, translateText(["validNoOfDaysRangeError"]))
      .test(
        "isValidFraction",
        translateText(["invalidFractionPointError"]),
        (value) => {
          return allowsOnlyNumbersAndOptionalDecimal().test(String(value));
        }
      ),
    type: Yup.string().required(
      translateText(["CustomLeaveAllocationTypeError"])
    )
  });

export const addLeaveTypeValidationSchema = (
  allLeaveTypes: LeaveTypeType[],
  translateText: TranslatorFunctionType
) =>
  Yup.object({
    name: Yup.string()
      .required(translateText(["emptyLeaveTypeNameError"]))
      .test(
        "is-unique-leave-type-name",
        translateText(["uniqueLeaveTypeNameError"]),
        function (value, { parent }) {
          if (allLeaveTypes) {
            const isUnique = allLeaveTypes?.every(
              (leaveType: LeaveTypeType) => {
                const isUnique =
                  value !== leaveType?.name?.trim().toLowerCase();

                const isOriginalValue = leaveType.typeId === parent?.typeId;

                return isUnique || isOriginalValue;
              }
            );

            return isUnique;
          }

          return true;
        }
      ),
    emoji: Yup.string().required(translateText(["emptyLeaveTypeEmojiError"])),
    colorCode: Yup.string()
      .transform((v) => (v === null ? "" : v))
      .required(translateText(["emptyLeaveTypeColorError"])),
    leaveDuration: Yup.string().test(
      "is-leave-duration-valid",
      translateText(["emptyLeaveDurationError"]),
      (value) => {
        return value !== LeaveDurationTypes.NONE;
      }
    ),
    isCarryForwardEnabled: Yup.boolean(),
    maxCarryForwardDays: Yup.number().when("isCarryForwardEnabled", {
      is: true,
      then: () =>
        Yup.number()
          .required(translateText(["emptyMaxCarryForwardDaysError"]))
          .min(1, translateText(["minCarryForwardExpirationDaysError"]))
          .max(365, translateText(["maxCarryForwardExpirationDaysError"]))
    }),
    carryForwardExpirationDate: Yup.string()
      .nullable()
      .when("isCarryForwardEnabled", {
        is: true,
        then: () =>
          Yup.string().required(
            translateText(["emptyCarryForwardExpirationDaysError"])
          )
      })
  });

export const addEditCustomLeaveAllocationValidationSchema = (
  translateText: TranslatorFunctionType
) =>
  Yup.object({
    name: Yup.string()
      .required(translateText(["emptyEmployeeNameError"]))
      .min(2, translateText(["minEmployeeNameLengthError"])),

    type: Yup.string().required(translateText(["emptyLeaveTypeError"])),

    numberOfDays: Yup.number()
      .required(translateText(["emptyNumberOfDaysError"]))
      .positive(translateText(["positiveNumberError"]))
      .integer(translateText(["integerNumberError"]))
      .min(1, translateText(["minNumberOfDaysError"]))
  });
