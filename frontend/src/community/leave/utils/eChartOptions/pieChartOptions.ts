import { type Theme, useTheme } from "@mui/material/styles";
import { type EChartsOption } from "echarts";

import {
  PieChartPosition,
  PieChartSeriesData
} from "~community/leave/types/AnalyticsTypes";

export const PieChartOptionConfig = (
  pieChartData: PieChartSeriesData[],
  pieChartPosition: PieChartPosition = "center",
  isIndividualCard: boolean = false
): EChartsOption => {
  const theme: Theme = useTheme();
  const position =
    pieChartPosition === "center" ? ["50%", "50%"] : ["50%", "74%"];
  const pieChartRadius = isIndividualCard ? ["75%", "100%"] : ["70%", "100%"];
  return {
    series: [
      {
        name: "Absent Pie chart",
        type: "pie",
        radius: pieChartRadius,
        avoidLabelOverlap: false,
        silent: true,
        color: [theme.palette.primary.dark, theme.palette.grey[500]],
        itemStyle: {
          borderRadius: 10,
          borderColor: theme.palette.common.white,
          borderWidth: 1
        },
        label: {
          show: false,
          position: "center"
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 40,
            fontWeight: "bold"
          }
        },
        labelLine: {
          show: false
        },
        data: pieChartData,
        center: position
      }
    ]
  };
};
