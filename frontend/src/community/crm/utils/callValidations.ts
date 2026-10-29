import * as Yup from "yup";

import { unitConversion } from "~community/common/constants/configs";
import {
  callDurationPartsPattern,
  callDurationPattern
} from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

export const parseCallDurationToMinutes = (input: string): number | null => {
  const [, hours, minutes] =
    callDurationPartsPattern().exec(input.trim()) ?? [];

  if (!hours && !minutes) return null;

  return (
    Number(hours ?? 0) * unitConversion.MINUTES_PER_HOUR + Number(minutes ?? 0)
  );
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
