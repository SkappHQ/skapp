import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { isTimeAfter } from "~community/crm/activities/utils/activityUtil";
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

        return isTimeAfter(endTime, startTime);
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
