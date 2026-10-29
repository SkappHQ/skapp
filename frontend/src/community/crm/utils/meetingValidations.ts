import { DateTime } from "luxon";
import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CALL_TIME_VALUE_FORMAT } from "~community/crm/constants/callConstants";

export const getMeetingValidationSchema = (
  translator: TranslatorFunctionType
) =>
  Yup.object().shape({
    subject: Yup.string()
      .trim()
      .required(
        translator([
          "activities",
          "logMeeting",
          "modal",
          "validations",
          "subject"
        ])
      ),
    date: Yup.string()
      .nullable()
      .required(
        translator(["activities", "logMeeting", "modal", "validations", "date"])
      ),
    startTime: Yup.string(),
    endTime: Yup.string().test(
      "is-after-start-time",
      translator([
        "activities",
        "logMeeting",
        "modal",
        "validations",
        "endTime"
      ]),
      function (endTime) {
        const { startTime } = this.parent;

        if (!startTime || !endTime) return true;

        return (
          DateTime.fromFormat(endTime, CALL_TIME_VALUE_FORMAT) >
          DateTime.fromFormat(startTime, CALL_TIME_VALUE_FORMAT)
        );
      }
    ),
    contactIds: Yup.array()
      .of(Yup.number())
      .min(
        1,
        translator([
          "activities",
          "logMeeting",
          "modal",
          "validations",
          "attendees"
        ])
      ),
    ownerId: Yup.number()
      .nullable()
      .required(
        translator([
          "activities",
          "logMeeting",
          "modal",
          "validations",
          "owner"
        ])
      )
  });
