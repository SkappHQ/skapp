import { ALL_LOCATIONS_LABEL } from "~community/common/constants/workLocationConstants";
import { createCSV } from "~community/common/utils/bulkUploadUtils";
import { currentYear } from "~community/common/utils/dateTimeUtils";
import {
  Holiday,
  HolidayDurationType
} from "~community/people/types/HolidayTypes";

const getDummyHolidayCsvData = (): Holiday[] => {
  return [
    {
      id: 1,
      date: `${currentYear}-04-14`,
      workLocations: [ALL_LOCATIONS_LABEL],
      name: "New year",
      holidayDuration: HolidayDurationType.FULLDAY
    },
    {
      id: 2,
      date: `${currentYear}-04-15`,
      workLocations: ["Sweden"],
      name: "New year Eve",
      holidayDuration: HolidayDurationType.HALFDAY_EVENING
    },
    {
      id: 3,
      date: `${currentYear}-04-17`,
      workLocations: ["Sweden", "Colombo"],
      name: "New year Holiday",
      holidayDuration: HolidayDurationType.HALFDAY_MORNING
    }
  ];
};

export const downloadBulkCsvTemplate = () => {
  const headers = ["Date", "Work Location", "Name", "Holiday Duration"];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");
      for (const holidayDetails of getDummyHolidayCsvData()) {
        const rowData = [
          holidayDetails?.date,
          `"${holidayDetails?.workLocations?.join(", ")}"`,
          holidayDetails?.name,
          holidayDetails?.holidayDuration
        ];
        controller.enqueue(rowData.join(",") + "\n");
      }

      controller.close();
    }
  });

  createCSV(stream, "HolidayBulkTemplate");
};
