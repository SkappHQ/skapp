import {
  LeaveTypeBreakDownReturnTypes,
  LeaveTypeBreakdownResponseType,
  TotalLeavesWithTypes
} from "../types/LeaveUtilizationTypes";

export function leaveTypeBreakdownPreProcessor(
  data: LeaveTypeBreakdownResponseType
) {
  const responseData: TotalLeavesWithTypes[] = data?.totalLeavesWithType;
  const preProcessedData: LeaveTypeBreakDownReturnTypes = {
    data: responseData.map((chartData) => {
      return {
        name: chartData?.leaveType?.name,
        type: "bar",
        data: Object.values(chartData?.leaveUtilizationData),
        color: chartData?.leaveType?.colorCode,
        emphasis: {
          focus: "series"
        }
      };
    }),
    labels: responseData?.map((data) => data?.leaveType?.name),
    toggle: responseData?.reduce(
      (a: Record<string, boolean>, v: TotalLeavesWithTypes) => {
        return {
          ...a,
          [v?.leaveType?.name]: true
        };
      },
      {}
    ),
    months: Object.keys(data?.totalLeaves)
  };

  return preProcessedData;
}
