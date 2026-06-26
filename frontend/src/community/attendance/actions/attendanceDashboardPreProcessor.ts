import {
  ClockInOutGraphDataType,
  LateArrivalsGraphDataType,
  WorkHoursGraphDataType
} from "../types/attendanceDashboardTypes";

export const graphDataPreprocessor = (
  graphData:
    | ClockInOutGraphDataType
    | LateArrivalsGraphDataType
    | WorkHoursGraphDataType
) => {
  if (graphData) {
    const labels: string[] = Object.keys(graphData);
    const preProcessedData: number[] = Object.values(graphData);
    return { preProcessedData, labels };
  }
};
