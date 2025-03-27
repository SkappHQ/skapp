import { parse } from "papaparse";
import { Dispatch, SetStateAction } from "react";

import { type FileUploadType } from "~community/common/types/CommonTypes";
import { toCamelCase } from "~community/common/utils/commonUtil";
import { HolidayType } from "~community/people/types/HolidayTypes";

const validateHeaders = async (file: File): Promise<boolean> => {
  const readCSVHeaders = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event?.target?.result as string;

        const headers = text
          .split("\n")[0]
          .split(",")
          .map((header) => header.trim());
        resolve(headers);
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsText(file);
    });
  };

  const includesInvalidHeaders = (headers: string[]): boolean => {
    const predefinedHeaders = ["Date", "Name", "Holiday Duration"];
    return headers?.some((header) => !predefinedHeaders?.includes(header));
  };

  const headers = await readCSVHeaders(file);

  const isValid = !includesInvalidHeaders(headers);

  return isValid;
};

const transformCSVHeaders = (header: string) => {
  return toCamelCase(header);
};

export const setAttachment = async ({
  acceptedFiles,
  translateText,
  setIsNewCalendarDetailsValid,
  setCalendarErrors,
  setHolidayBulkList,
  setNewCalendarDetails
}: {
  acceptedFiles: FileUploadType[];
  setCalendarErrors: (value: string) => void;
  setIsNewCalendarDetailsValid: (value: boolean) => void;
  translateText: (keys: string[]) => string;
  setHolidayBulkList: Dispatch<SetStateAction<HolidayType[]>>;
  setNewCalendarDetails: (value: FileUploadType[]) => void;
}): Promise<void> => {
  setIsNewCalendarDetailsValid(false);
  setNewCalendarDetails(acceptedFiles);
  setCalendarErrors("");

  if (acceptedFiles?.length > 0) {
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
            setCalendarErrors(translateText(["emptyFileError"]));
          } else {
            setIsNewCalendarDetailsValid(true);
            setHolidayBulkList(recordDetails.data);
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
