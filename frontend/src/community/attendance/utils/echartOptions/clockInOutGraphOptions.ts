import { type Theme, useTheme } from "@mui/material/styles";

import { XIndexTypes } from "~community/common/types/CommonTypes";
import { SingleTooltipFormatterParams } from "~community/common/types/EchartTypes";
import { getCommonEChartOptions } from "~community/common/utils/eChartsCommonStyles";
import GraphTooltip from "~community/people/utils/eChartOptions/GraphTooltip";

export const useClockInOutGraphOptions = (
  datasets: { preProcessedData: number[]; labels: string[] },
  xIndexDay: XIndexTypes
) => {
  const theme: Theme = useTheme();
  const commonOptions = getCommonEChartOptions(theme);

  return {
    ...commonOptions,
    xAxis: {
      ...commonOptions.xAxis,
      data: datasets?.labels,
      min: xIndexDay.startIndex,
      max: xIndexDay.endIndex
    },
    tooltip: {
      trigger: "axis",
      padding: [4, 12],
      borderRadius: 12,
      borderColor: "transparent",
      formatter: (params: SingleTooltipFormatterParams[]) =>
        GraphTooltip(params[0].value as number, params[0].name as string)
    },
    series: [
      {
        data: datasets?.preProcessedData,
        type: "bar",
        itemStyle: { color: theme.palette.graphColors.green, borderRadius: 7 },
        barWidth: "40rem",
        label: {
          show: true,
          position: "bottom",
          color: theme.palette.common.white,
          offset: [0, -30],
          fontWeight: "bold"
        }
      },
      {
        type: "line",
        smooth: true,
        symbol: "none",
        data: datasets?.preProcessedData,
        lineStyle: { color: theme.palette.graphColors.green }
      }
    ]
  };
};
