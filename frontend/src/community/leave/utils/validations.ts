import * as Yup from "yup";

import { allowsOnlyNumbersAndOptionalDecimal } from "~community/common/regex/regexPatterns";
import {
  MAX_POLICY_DAYS,
  MAX_POLICY_NAME_LENGTH,
  MIN_ACCRUAL_CAP_DAYS,
  MIN_POLICY_DAYS,
  MIN_WAITING_PERIOD_DAYS,
  POLICY_DAYS_STEP
} from "~community/leave/constants/leavePolicyConstants";
import { MAX_POLICY_LEAVE_TYPE_NAME_LENGTH } from "~community/leave/constants/policyLeaveTypeConstants";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";

type TranslatorFunctionType = (
  suffixes: string[],
  interpolationValues?: Record<string, string>
) => string;

const isNumberInRange = (
  value: string | undefined,
  min: number,
  max?: number
): boolean => {
  const numericValue = Number(value);
  return (
    value !== undefined &&
    value !== "" &&
    !Number.isNaN(numericValue) &&
    numericValue >= min &&
    (max === undefined || numericValue <= max)
  );
};

const isPolicyDaysStepValid = (value: string | undefined): boolean => {
  const numericValue = Number(value);
  return (
    value !== undefined &&
    value !== "" &&
    !Number.isNaN(numericValue) &&
    Number.isInteger(numericValue / POLICY_DAYS_STEP)
  );
};

const isWholeNumberOfDays = (value: string | undefined): boolean => {
  const numericValue = Number(value);
  return (
    value !== undefined &&
    value !== "" &&
    !Number.isNaN(numericValue) &&
    Number.isInteger(numericValue)
  );
};

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

export const policyLeaveTypeValidationSchema = (
  translateText: TranslatorFunctionType
) =>
  Yup.object({
    name: Yup.string()
      .trim()
      .required(translateText(["emptyLeaveTypeNameError"]))
      .max(
        MAX_POLICY_LEAVE_TYPE_NAME_LENGTH,
        translateText(["leaveTypeNameMaxLengthError"])
      ),
    emoji: Yup.string().required(translateText(["emptyLeaveTypeEmojiError"])),
    colorCode: Yup.string()
      .transform((value) => (value === null ? "" : value))
      .required(translateText(["emptyLeaveTypeColorError"])),
    minDuration: Yup.string().test(
      "is-min-duration-valid",
      translateText(["emptyLeaveDurationError"]),
      (value) => value !== LeaveDurationTypes.NONE
    )
  });

export const editLeavePolicyValidation = (
  translateText: TranslatorFunctionType
) =>
  Yup.object({
    policyName: Yup.string()
      .trim()
      .required(translateText(["policyNameRequiredError"]))
      .max(MAX_POLICY_NAME_LENGTH, translateText(["policyNameMaxLengthError"]))
  });

export const leavePolicyWizardValidation = (
  translateText: TranslatorFunctionType,
  isAccrual: boolean
) =>
  Yup.object({
    policyName: Yup.string()
      .trim()
      .required(translateText(["errors", "policyNameRequired"]))
      .max(
        MAX_POLICY_NAME_LENGTH,
        translateText(["errors", "policyNameMaxLength"])
      ),
    leaveType: Yup.string().required(
      translateText(["errors", "leaveTypeRequired"])
    ),
    ...(isAccrual
      ? {
          accrualDays: Yup.string()
            .required(translateText(["errors", "accrualDaysRequired"]))
            .test(
              "accrual-days-in-range",
              translateText(["errors", "accrualDaysInvalid"]),
              (value) =>
                isNumberInRange(value, MIN_POLICY_DAYS, MAX_POLICY_DAYS)
            )
            .test(
              "accrual-days-step-valid",
              translateText(["errors", "accrualDaysStepInvalid"]),
              (value) => !value || isPolicyDaysStepValid(value)
            ),
          accrualFrequency: Yup.string().required(
            translateText(["errors", "frequencyRequired"])
          ),
          hasWaitingPeriod: Yup.boolean(),
          waitingPeriodDays: Yup.string().when("hasWaitingPeriod", {
            is: true,
            then: (schema) =>
              schema
                .test(
                  "waiting-period-days-valid",
                  translateText(["errors", "waitingPeriodDaysRequired"]),
                  (value) => isNumberInRange(value, MIN_WAITING_PERIOD_DAYS)
                )
                .test(
                  "waiting-period-days-whole-number",
                  translateText(["errors", "waitingPeriodDaysNotWholeNumber"]),
                  (value) => !value || isWholeNumberOfDays(value)
                )
          }),
          hasAccrualCap: Yup.boolean(),
          accrualCapDays: Yup.string().when("hasAccrualCap", {
            is: true,
            then: (schema) =>
              schema
                .test(
                  "accrual-cap-days-valid",
                  translateText(["errors", "accrualCapRequired"]),
                  (value) => isNumberInRange(value, MIN_ACCRUAL_CAP_DAYS)
                )
                .test(
                  "accrual-cap-days-step-valid",
                  translateText(["errors", "accrualCapStepInvalid"]),
                  (value) => !value || isPolicyDaysStepValid(value)
                )
          }),
          canCarryOver: Yup.boolean(),
          maxCarryOverDays: Yup.string().when("canCarryOver", {
            is: true,
            then: (schema) =>
              schema
                .required(translateText(["errors", "maxCarryOverDaysRequired"]))
                .test(
                  "max-carryover-days-valid",
                  translateText(["errors", "maxCarryOverDaysInvalid"]),
                  (value) =>
                    !value ||
                    isNumberInRange(value, MIN_POLICY_DAYS, MAX_POLICY_DAYS)
                )
                .test(
                  "max-carryover-days-step-valid",
                  translateText(["errors", "maxCarryOverDaysStepInvalid"]),
                  (value) => !value || isPolicyDaysStepValid(value)
                )
          })
        }
      : {})
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
