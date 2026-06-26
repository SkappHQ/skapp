import { DateTime } from "luxon";

import { DATE_FORMAT } from "../constants/constants";

export const normalizeDate = (inputDate: string): string | null => {
  const formats = [
    DATE_FORMAT.YYYY_MM_DD_SLASH,
    DATE_FORMAT.YYYY_MM_DD_DASH,
    DATE_FORMAT.YYYY_M_D_SLASH,
    DATE_FORMAT.YYYY_M_D_DASH,
    DATE_FORMAT.MM_DD_YYYY_SLASH,
    DATE_FORMAT.MM_DD_YYYY_DASH,
    DATE_FORMAT.DD_MM_YYYY_SLASH,
    DATE_FORMAT.DD_MM_YYYY_DASH,
    DATE_FORMAT.M_D_YYYY_SLASH,

    DATE_FORMAT.D_M_YYYY_SLASH,
    DATE_FORMAT.YYYY_DD_MM_SLASH,
    DATE_FORMAT.YYYY_DD_MM_DASH
  ];
  const validFormat = formats
    .map((fmt) => DateTime.fromFormat(inputDate, fmt))
    .find((parsedDate) => parsedDate.isValid);

  if (validFormat) {
    return validFormat.toFormat(DATE_FORMAT.YYYY_MM_DD_DASH);
  }

  return null;
};
