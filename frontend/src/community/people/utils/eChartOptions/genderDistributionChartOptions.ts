import { type Theme, useTheme } from "@mui/material/styles";

import { SingleTooltipFormatterParams } from "~community/common/types/EchartTypes";
import { getCommonEChartOptions } from "~community/common/utils/eChartsCommonStyles";
import { GenderDistributionType } from "~community/people/types/PeopleDashboardTypes";

import GraphTooltip from "./GraphTooltip";

export const useGenderDistributionChartOptions = (
  data: GenderDistributionType[]
) => {
  const theme: Theme = useTheme();
  const commonOptions = getCommonEChartOptions(theme);

  return {
    ...commonOptions,
    tooltip: {
      trigger: "item",
      borderColor: "white",
      formatter: (params: SingleTooltipFormatterParams) =>
        GraphTooltip(params.value as number, params.name)
    },
    grid: {
      top: "15%",
      left: "1%",
      right: "5%",
      bottom: "25%"
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      icon: "circle",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 90,
      textStyle: {
        color: theme.palette.text.primary,
        fontSize: 12,
        fontFamily: theme.typography.fontFamily
      }
    },
    series: [
      {
        type: "pie",
        radius: ["60%", "110%"], // Inner and outer radius for donut
        center: ["50%", "70%"], // Lower the center to make it half-circle
        startAngle: 180,
        endAngle: 0,
        avoidLabelOverlap: false,
        label: {
          show: false
        },

        data
      }
    ]
  };
};
