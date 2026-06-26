import { type Theme, useTheme } from "@mui/material";

import { XIndexTypes } from "~community/common/types/CommonTypes";
import { SingleTooltipFormatterParams } from "~community/common/types/EchartTypes";
import { getCommonEChartOptions } from "~community/common/utils/eChartsCommonStyles";

import WorkHourGraphTooltip from "./WorkHourGraphTooltip";

export const useWorkHourTrendChartOptions = (
  labels: string[],
  xIndexDay: XIndexTypes,
  datasets: number[]
) => {
  const theme: Theme = useTheme();
  const commonOptions = getCommonEChartOptions(theme);

  return {
    ...commonOptions,
    tooltip: {
      trigger: "axis",
      padding: [4, 12],
      borderRadius: 12,
      borderColor: "transparent",
      formatter: (params: SingleTooltipFormatterParams[]) =>
        params.length ? WorkHourGraphTooltip(params[0].value as number) : ""
    },
    xAxis: {
      ...commonOptions.xAxis,
      data: labels,
      min: xIndexDay.startIndex,
      max: xIndexDay.endIndex,
      axisLabel: {
        ...commonOptions.xAxis.axisLabel,
        fontSize: 11
      }
    },
    series: [
      {
        data: datasets,
        type: "line",
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 1, color: theme.palette.graphColors.green },
        symbol: "circle",
        itemStyle: { color: theme.palette.graphColors.green }
      }
    ]
  };
};
