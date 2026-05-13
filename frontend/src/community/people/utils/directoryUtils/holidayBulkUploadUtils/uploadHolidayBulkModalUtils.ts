import { parse } from "papaparse";
import React, { Dispatch, SetStateAction } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import {
  matchesMMDDYYYYSeparatedByHyphenOrSlashOrPeriod,
  matchesYYYYMMDDSeparatedByHyphenOrSlashOrPeriod
} from "~community/common/regex/regexPatterns";
import { type FileUploadType } from "~community/common/types/CommonTypes";
import { ToastProps } from "~community/common/types/ToastTypes";
import { toCamelCase } from "~community/common/utils/commonUtil";
import { HolidayType } from "~community/people/types/HolidayTypes";

const validateHeaders = async (file: File): Promise<boolean> => {
  const readCSVHeaders = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event?.target?.result as string;

        const formattedText = text.split("\n")[0].split(",");

        const headers = formattedText.map((header) => header.trim());

        resolve(headers);
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsText(file);
    });
  };

  const includesInvalidHeaders = (headers: string[]): boolean => {
    const predefinedHeaders = [
      "Date",
      "Work Location",
      "Name",
      "Holiday Duration"
    ];
    return headers?.some((header) => !predefinedHeaders?.includes(header));
  };

  const headers = await readCSVHeaders(file);

  const isValid = !includesInvalidHeaders(headers);

  return isValid;
};

const transformCSVHeaders = (header: string) => {
  return toCamelCase(header);
};

export const normalizeHolidayDates = (
  holidays: HolidayType[]
): HolidayType[] => {
  return holidays.map((holiday) => {
    const formattedDate = formatToStrictYMD(holiday.date);
    return {
      ...holiday,
      date: formattedDate ?? holiday.date
    };
  });
};

const formatToStrictYMD = (inputDate: string): string => {
  const startsWithYearMatch = inputDate.match(
    matchesYYYYMMDDSeparatedByHyphenOrSlashOrPeriod()
  );

  const endsWithYearMatch = inputDate.match(
    matchesMMDDYYYYSeparatedByHyphenOrSlashOrPeriod()
  );

  if (startsWithYearMatch === null && endsWithYearMatch === null) {
    return inputDate;
  }

  let year: string;
  let month: string;
  let day: string;

  if (startsWithYearMatch) {
    [, year, month, day] = startsWithYearMatch;
  } else {
    [, month, day, year] = endsWithYearMatch!;
  }

  month = month.padStart(2, "0");
  day = day.padStart(2, "0");

  const reconstructedDate = new Date(`${year}-${month}-${day}`);

  const isValid =
    !isNaN(reconstructedDate.getTime()) &&
    reconstructedDate.getFullYear() === Number(year) &&
    reconstructedDate.getMonth() === Number(month) - 1 &&
    reconstructedDate.getDate() === Number(day);

  return isValid ? `${year}-${month}-${day}` : inputDate;
};

export const setAttachment = async ({
  acceptedFiles,
  translateText,
  setIsNewCalendarDetailsValid,
  setCalendarErrors,
  setHolidayBulkList,
  setNewCalendarDetails,
  setToastMessage
}: {
  acceptedFiles: FileUploadType[];
  setCalendarErrors: (value: string) => void;
  setIsNewCalendarDetailsValid: (value: boolean) => void;
  translateText: (keys: string[]) => string;
  setHolidayBulkList: Dispatch<SetStateAction<HolidayType[]>>;
  setNewCalendarDetails: (value: FileUploadType[]) => void;
  setToastMessage: (value: React.SetStateAction<ToastProps>) => void;
}): Promise<void> => {
  setIsNewCalendarDetailsValid(false);
  setNewCalendarDetails(acceptedFiles);
  setCalendarErrors("");

  if (acceptedFiles?.length > 0) {
    const file = acceptedFiles[0].file ?? new File([], "");

    const fileContent = await file.text();
    if (!fileContent.trim()) {
      setToastMessage({
        title: translateText(["noRecordCSVTitle"]),
        description: translateText(["noRecordCSVDes"]),
        isIcon: true,
        toastType: ToastType.ERROR,
        open: true
      });
      return;
    }

    const areHeadersValid = await validateHeaders(
      acceptedFiles[0].file ?? new File([], "")
    );

    if (areHeadersValid) {
      parse(acceptedFiles?.[0].file as File, {
        header: true,
        skipEmptyLines: true,
        transformHeader: transformCSVHeaders,
        complete: function (recordDetails: { data: HolidayType[] }) {
          if (recordDetails?.data?.length === 0) {
            setToastMessage({
              title: translateText(["noRecordCSVTitle"]),
              description: translateText(["noRecordCSVDes"]),
              isIcon: true,
              toastType: ToastType.ERROR,
              open: true
            });
          } else {
            setIsNewCalendarDetailsValid(true);
            setHolidayBulkList(normalizeHolidayDates(recordDetails.data));
          }
        }
      });
    } else {
      setCalendarErrors(translateText(["invalidTemplateError"]));
    }
  } else {
    setNewCalendarDetails([]);
  }
};
