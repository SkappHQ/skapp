import * as Yup from "yup";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  getActivityOwnerValidation,
  getActivitySubjectValidation,
  isEndTimeAfterStartTime
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
      isEndTimeAfterStartTime
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
