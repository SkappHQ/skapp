import { APP_FONT } from "~community/common/constants/configs";
import { theme } from "~community/common/theme/theme";

import {
  APIResponseDataType,
  CustomLabelSeriesType,
  CustomSeriesType,
  LeaveTrendForYearResponseType,
  LeaveTrendReturnTypes,
  LeaveTypeSeriesTypes,
  LineChartLineTypes,
  SelectedTypeCountTypes,
  TotalLeavesWithTypes
} from "../types/TeamLeaveAnalyticsTypes";

function createCustomSeriesType(
  name: string,
  data: number[],
  color: string,
  lineType: LineChartLineTypes = "dashed",
  dataPreProcessor?: (dataSet: number[]) => CustomLabelSeriesType[]
): CustomSeriesType {
  return {
    name,
    type: "line",
    smooth: true,
    data: dataPreProcessor ? dataPreProcessor(data) : data,
    lineStyle: {
      width: 1,
      type: lineType,
      color
    },
    itemStyle: {
      color
    }
  };
}

function createLeaveTypeSeriesType(
  leaveTypeName: string,
  color: string
): LeaveTypeSeriesTypes {
  return {
    leaveTypeName,
    color,
    selected: false
  };
}

function getSelectedIndices(
  leaveTypeSeries: LeaveTypeSeriesTypes[],
  selectedCount: SelectedTypeCountTypes
): LeaveTypeSeriesTypes[] {
  if (selectedCount === "ALL") selectedCount = leaveTypeSeries?.length;
  else if (+selectedCount < 0) selectedCount = 0;
  else if (+selectedCount > leaveTypeSeries?.length)
    selectedCount = leaveTypeSeries?.length;
  return leaveTypeSeries.map((series, index: number) => ({
    ...series,
    selected: index < +selectedCount
  }));
}

export const preProcessTotalValueWithLabel = (
  dataArr: number[]
): CustomLabelSeriesType[] => {
  return dataArr.map((value, index) => {
    if (index === 0) {
      return {
        value,
        label: {
          show: true,
          position: "inside",
          formatter: "Total",
          fontFamily: APP_FONT,
          backgroundColor: theme.palette.common.white,
          borderRadius: 64,
          padding: [4, 8],
          fontSize: 12,
          color: theme.palette.common.black
        }
      };
    } else {
      return value;
    }
  });
};

export function LeaveTrendForYearPreProcessor(
  APIReturnedData: APIResponseDataType<LeaveTrendForYearResponseType>,
  selectedTypeCount: SelectedTypeCountTypes = "ALL"
): LeaveTrendReturnTypes {
  const commonLabelProp = {
    name: "Total",
    color: theme.palette.common.black,
    lineType: "solid",
    isShow: true
  };

  const result: LeaveTrendForYearResponseType =
    APIReturnedData?.results?.length > 0
      ? APIReturnedData?.results[0]
      : undefined;

  if (!result)
    return {
      leaveChartDataSeries: [],
      leaveTypeForYearDataSeries: []
    };

  const totalSeries: CustomSeriesType =
    commonLabelProp?.isShow &&
    createCustomSeriesType(
      commonLabelProp?.name,
      Object.values(result.totalLeaves),
      commonLabelProp?.color,
      commonLabelProp?.lineType as LineChartLineTypes,
      preProcessTotalValueWithLabel
    );

  const totalType: LeaveTypeSeriesTypes =
    commonLabelProp?.isShow &&
    createLeaveTypeSeriesType(commonLabelProp?.name, commonLabelProp?.color);

  const totalLeaveForTypeSeries: CustomSeriesType[] =
    result.totalLeavesWithType?.map((totalLeaveForType: TotalLeavesWithTypes) =>
      createCustomSeriesType(
        totalLeaveForType?.leaveType?.name,
        Object.values(totalLeaveForType?.leaveTrendData),
        totalLeaveForType?.leaveType?.colorCode
      )
    ) || [];

  const leaveTypeOfSeries: LeaveTypeSeriesTypes[] =
    result?.totalLeavesWithType?.map(
      (totalLeaveForType: TotalLeavesWithTypes) =>
        createLeaveTypeSeriesType(
          totalLeaveForType?.leaveType?.name,
          totalLeaveForType?.leaveType?.colorCode
        )
    ) || [];

  const leaveChartDataSeries: CustomSeriesType[] = [
    totalSeries,
    ...totalLeaveForTypeSeries
  ];

  const leaveTypeSeries: LeaveTypeSeriesTypes[] = [
    totalType,
    ...leaveTypeOfSeries
  ];

  return {
    leaveChartDataSeries,
    leaveTypeForYearDataSeries: getSelectedIndices(
      leaveTypeSeries,
      selectedTypeCount
    ),
    months: Object.keys(result?.totalLeaves)
  };
}
