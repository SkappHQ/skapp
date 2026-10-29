import * as Yup from "yup";

import { unitConversion } from "~community/common/constants/configs";
import { callDurationPattern } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

const CALL_DURATION_REGEX = {
  MINUTES_ONLY: /^\d+$/,
  HOURS_AND_MINUTES: /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/i
};

export const parseCallDurationToMinutes = (input: string): number | null => {
  const value = input.trim();

  if (CALL_DURATION_REGEX.MINUTES_ONLY.test(value)) return Number(value);

  const match = CALL_DURATION_REGEX.HOURS_AND_MINUTES.exec(value);

  if (!match || (!match[1] && !match[2])) return null;

  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;

  return hours * unitConversion.MINUTES_PER_HOUR + minutes;
};

export const getCallValidationSchema = (translator: TranslatorFunctionType) =>
  Yup.object().shape({
    subject: Yup.string()
      .trim()
      .required(
        translator(["activities", "logCall", "modal", "validations", "subject"])
      ),
    duration: Yup.string()
      .trim()
      .matches(callDurationPattern(), {
        message: translator([
          "activities",
          "logCall",
          "modal",
          "validations",
          "duration"
        ]),
        excludeEmptyString: true
      }),
    contactId: Yup.number()
      .nullable()
      .required(
        translator(["activities", "logCall", "modal", "validations", "contact"])
      ),
    ownerId: Yup.number()
      .nullable()
      .required(
        translator(["activities", "logCall", "modal", "validations", "owner"])
      )
  });
