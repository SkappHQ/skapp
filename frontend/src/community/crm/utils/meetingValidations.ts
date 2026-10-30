import { DateTime } from "luxon";
import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { ACTIVITY_TIME_VALUE_FORMAT } from "~community/crm/activities/constants/activityConstants";
import {
  getActivityOwnerValidation,
  getActivitySubjectValidation
} from "~community/crm/activities/utils/activityValidations";

export const getMeetingValidationSchema = (
  translator: TranslatorFunctionType
) =>
  Yup.object().shape({
    subject: getActivitySubjectValidation(translator),
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
          DateTime.fromFormat(endTime, ACTIVITY_TIME_VALUE_FORMAT) >
          DateTime.fromFormat(startTime, ACTIVITY_TIME_VALUE_FORMAT)
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
    ownerId: getActivityOwnerValidation(translator)
  });
