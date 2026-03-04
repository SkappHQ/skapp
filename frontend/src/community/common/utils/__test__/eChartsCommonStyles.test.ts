import { Theme } from "@mui/material/styles";

import { getCommonEChartOptions } from "../eChartsCommonStyles";

describe("getCommonEChartOptions", () => {
  const mockTheme: Theme = {
    palette: {
      text: { primary: "#000000" },
      common: { black: "#000000" },
      grey: { A400: "#BDBDBD" }
    },
    typography: { fontFamily: "Roboto" }
  } as Theme;

  it("should return correct grid configuration", () => {
    const options = getCommonEChartOptions(mockTheme);
    expect(options.grid).toEqual({
      top: "15%",
      bottom: "15%",
      right: "2%",
      left: "4%"
    });
  });

  it("should return correct legend configuration", () => {
    const options = getCommonEChartOptions(mockTheme);
    expect(options.legend).toEqual({
      show: false,
      textStyle: {
        color: mockTheme.palette.text.primary,
        fontFamily: mockTheme.typography.fontFamily
      }
    });
  });

  it("should return correct xAxis configuration", () => {
    const options = getCommonEChartOptions(mockTheme);
    expect(options.xAxis).toEqual({
      type: "category",
      axisLine: { show: false },
      splitLine: { show: false },
      axisTick: { alignWithLabel: true, interval: 0 },
      axisLabel: {
        color: mockTheme.palette.common.black,
        fontSize: 12,
        fontFamily: mockTheme.typography.fontFamily
      }
    });
  });

  it("should return correct yAxis configuration", () => {
    const options = getCommonEChartOptions(mockTheme);
    expect(options.yAxis).toEqual({
      type: "value",
      minInterval: 1,
      axisLine: {
        lineStyle: { color: mockTheme.palette.grey.A400, opacity: 0.5 }
      },
      splitLine: {
        lineStyle: { color: mockTheme.palette.grey.A400, opacity: 0.5 }
      },
      axisLabel: {
        color: mockTheme.palette.common.black,
        fontSize: 13,
        fontFamily: "Inter"
      },
      scale: true
    });
  });

  it("should return correct tooltip configuration", () => {
    const options = getCommonEChartOptions(mockTheme);
    expect(options.tooltip).toEqual({
      borderColor: "white"
    });
  });
});
