import { type Theme, useTheme } from "@mui/material/styles";

import { XIndexTypes } from "~community/common/types/CommonTypes";
import { SingleTooltipFormatterParams } from "~community/common/types/EchartTypes";
import { getCommonEChartOptions } from "~community/common/utils/eChartsCommonStyles";
import GraphTooltip from "~community/people/utils/eChartOptions/GraphTooltip";

export const useLateArrivalsGraphOptions = (
  datasets: { preProcessedData: number[]; labels: string[] },
  xIndexDay: XIndexTypes
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
        GraphTooltip(params[0]?.value as number, params[0]?.name as string)
    },
    xAxis: {
      ...commonOptions.xAxis,
      data: datasets?.labels,
      min: xIndexDay.startIndex,
      max: xIndexDay.endIndex,
      axisLabel: {
        fontSize: "10px",
        interval: 0,
        color: "black",
        fontFamily: theme.typography.fontFamily
      }
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "none",
        data: datasets?.preProcessedData,
        lineStyle: { color: theme.palette.graphColors.pink },
        areaStyle: { color: theme.palette.lateArrivalsChart.area }
      }
    ]
  };
};
