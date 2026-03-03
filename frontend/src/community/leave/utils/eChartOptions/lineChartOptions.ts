import type * as echarts from "echarts";

import { APP_FONT } from "~community/common/constants/configs";
import { MultipleTooltipFormatterParams } from "~community/common/types/EchartTypes";
import {
  LeaveTrendReturnTypes,
  SelectedFiltersTypes
} from "~community/leave/types/TeamLeaveAnalyticsTypes";

import LeaveTrendForYearTooltip from "../html/LeaveTrendForYearTooltip";

export const LeaveTrendForYearLineChartOptions = (
  data: LeaveTrendReturnTypes,
  labels: string[],
  selectedValues: SelectedFiltersTypes,
  minMonth: number,
  maxMonth: number,
  monthsArray: string[]
) => {
  return {
    animationDuration: 2000,
    tooltip: {
      trigger: "axis",
      padding: [4, 12],
      borderRadius: 12,
      formatter: function (params: MultipleTooltipFormatterParams) {
        const paramsFilteredByValue = params?.filter(
          (param) => param.value !== 0
        );
        if (paramsFilteredByValue.length === 0) {
          return "";
        }
        return LeaveTrendForYearTooltip(paramsFilteredByValue);
      }
    },
    legend: {
      show: false,
      data: labels,
      selected: selectedValues
    },
    grid: {
      top: "12%",
      left: "1.5%",
      right: "2%",
      bottom: "2%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: true,
      data: monthsArray,
      axisTick: {
        show: false
      },
      min: minMonth,
      max: maxMonth,
      axisLabel: {
        margin: 15,
        fontFamily: APP_FONT,
        fontSize: 10
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 10,
        margin: 20
      }
    },
    series: data?.leaveChartDataSeries as echarts.SeriesOption[]
  };
};
