import { SingleTooltipFormatterParams } from "~community/common/types/EchartTypes";
import { EmploymentBreakdownType } from "~community/people/types/PeopleDashboardTypes";

import GraphTooltip from "./GraphTooltip";

export const useEmploymentBreakdownChartOptions = (
  data: EmploymentBreakdownType
) => {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: (params: SingleTooltipFormatterParams[]) =>
        GraphTooltip(params[0]?.value as number, params[0].name)
    },
    grid: {
      top: "15%",
      left: "1%",
      right: "5%"
    },
    xAxis: {
      boundaryGap: [0, 0.01],
      axisLine: { show: true },
      axisTick: { show: false },
      splitLine: { show: false },
      type: "value",
      interval: 1
    },
    yAxis: {
      data: data?.labels,
      axisLine: { show: false },
      axisTick: { show: false },
      type: "category"
    },
    series: [
      {
        type: "bar",
        data: data?.values,
        itemStyle: {
          borderRadius: [5],
          color: (params: any) => {
            // Color based on data index
            return data?.colors[params.dataIndex];
          }
        },
        barWidth: "100%"
      }
    ]
  };
};
