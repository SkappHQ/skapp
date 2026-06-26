import { createCSV } from "~community/common/utils/bulkUploadUtils";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";

import { DownloadDataAsCSVType } from "../types/TeamLeaveAnalyticsTypes";

export const updateToggleState = ({
  buttonType,
  initialList
}: {
  buttonType: string;
  initialList: Record<string, boolean>;
}) => {
  const updatedToggle = {
    ...initialList,
    [buttonType]: !initialList[buttonType]
  };

  const reorderedKeys = Object.keys(updatedToggle).sort((a, b) => {
    if (updatedToggle[a] && !updatedToggle[b]) {
      return -1;
    } else if (!updatedToggle[a] && updatedToggle[b]) {
      return 1;
    }
    return 0;
  });
  const reorderedObj: Record<string, boolean> = {};
  reorderedKeys.forEach((key) => {
    reorderedObj[key] = updatedToggle[key];
  });
  return reorderedObj;
};

export const formatChartButtonList = ({
  colorList,
  labelList
}: {
  colorList: string[];
  labelList: string[];
}) => {
  const transformedData: Record<string, string> = {};
  labelList?.forEach((label, index) => {
    transformedData[label] = colorList[index];
  });
  return transformedData;
};

export const formatChartDate = (date: string) =>
  convertDateToFormat(new Date(date), "dd/MM/yyyy");

export const downloadDataAsCSVTeam = ({ data }: DownloadDataAsCSVType) => {
  const stream = new ReadableStream({
    start(controller) {
      // CSV header
      controller.enqueue(
        "MEMBER,PERIOD,TYPE,STATUS,DAYS,DATE REQUESTED,REASON\n"
      );

      // CSV row
      for (const item of data) {
        const {
          employeeResponseDto: { firstName, lastName },
          leaveRequestResponseDto: {
            startDate,
            endDate,
            leaveType,
            status,
            durationDays,
            createdDate,
            requestDesc
          }
        } = item;
        const row = `${firstName} ${lastName},"${formatChartDate(
          startDate
        )} - ${formatChartDate(endDate)}","${
          leaveType.name
        }","${status}",${durationDays},"${formatChartDate(
          createdDate
        )}","${requestDesc}"\n`;
        controller.enqueue(row);
      }

      controller.close();
    }
  });
  createCSV(stream, "leave-history");
  createCSV(stream, "leave-history");
};
