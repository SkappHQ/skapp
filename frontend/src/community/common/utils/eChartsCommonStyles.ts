import { Theme } from "@mui/material/styles";

export const getCommonEChartOptions = (theme: Theme) => ({
  grid: {
    top: "15%",
    bottom: "15%",
    right: "2%",
    left: "4%"
  },
  legend: {
    show: false,
    textStyle: {
      color: theme.palette.text.primary,
      fontFamily: theme.typography.fontFamily
    }
  },
  xAxis: {
    type: "category",
    axisLine: { show: false },
    splitLine: { show: false },
    axisTick: { alignWithLabel: true, interval: 0 },
    axisLabel: {
      color: theme.palette.common.black,
      fontSize: 12,
      fontFamily: theme.typography.fontFamily
    }
  },
  yAxis: {
    type: "value",
    minInterval: 1,
    axisLine: {
      lineStyle: { color: theme.palette.grey.A400, opacity: 0.5 }
    },
    splitLine: {
      lineStyle: { color: theme.palette.grey.A400, opacity: 0.5 }
    },
    axisLabel: {
      color: theme.palette.common.black,
      fontSize: 13,
      fontFamily: "Inter"
    },
    scale: true
  },
  tooltip: {
    borderColor: "white"
  }
});
