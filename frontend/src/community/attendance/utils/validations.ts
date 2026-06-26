import { DateTime } from "luxon";
import * as Yup from "yup";

import {
  datePatternReverse,
  isValidTimeIn12HourFormat
} from "~community/common/regex/regexPatterns";

export const timeEntryValidation = Yup.object({
  timeEntryDate: Yup.string()
    .matches(datePatternReverse(), "Please enter a valid date")
    .required("Please select a date"),
  fromTime: Yup.string()
    .matches(isValidTimeIn12HourFormat(), "Please enter a valid start time")
    .required("Please select start time")
    .test(
      "is-greater",
      "Start time cannot be later than the end time.",
      function (value) {
        const { toTime } = this.parent;
        if (toTime && value) {
          const fromTimeObj = DateTime.fromFormat(value, "hh:mm a");
          const toTimeObj = DateTime.fromFormat(toTime, "hh:mm a");
          return fromTimeObj <= toTimeObj;
        }
        return true;
      }
    ),
  toTime: Yup.string()
    .matches(isValidTimeIn12HourFormat(), "Please enter a valid end time")
    .required("Please select end time")
});
