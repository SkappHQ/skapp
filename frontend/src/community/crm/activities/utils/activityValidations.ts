import { DateTime } from "luxon";
import * as Yup from "yup";

import { TIME_FORMAT_24_HOUR } from "~community/common/constants/timeConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export function isEndTimeAfterStartTime(
  this: Yup.TestContext,
  endTime?: string
): boolean {
  const { startTime } = this.parent;

  if (!startTime || !endTime) return true;

  return (
    DateTime.fromFormat(endTime, TIME_FORMAT_24_HOUR) >
    DateTime.fromFormat(startTime, TIME_FORMAT_24_HOUR)
  );
}

export const getActivitySubjectValidation = (
  translator: TranslatorFunctionType
) =>
  Yup.string()
    .trim()
    .required(
      translator(["activities", "logActivity", "validations", "subject"])
    );

export const getActivityOwnerValidation = (
  translator: TranslatorFunctionType
) =>
  Yup.number()
    .nullable()
    .required(
      translator(["activities", "logActivity", "validations", "owner"])
    );
