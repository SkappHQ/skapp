import { EmploymentBreakdownType } from "~community/people/types/PeopleDashboardTypes";

import { useEmploymentBreakdownChartOptions } from "./employmentBreakdownChartOptions";

describe("useEmploymentBreakdownChartOptions", () => {
  const mockData: EmploymentBreakdownType = {
    labels: ["Label1", "Label2", "Label3"],
    values: [10, 20, 30],
    colors: ["#FF0000", "#00FF00", "#0000FF"]
  };

  it("should return correct tooltip configuration", () => {
    const options = useEmploymentBreakdownChartOptions(mockData);
    expect(options.tooltip.trigger).toBe("axis");
    expect(options.tooltip.axisPointer.type).toBe("shadow");
    const formatter = options.tooltip.formatter;
    const mockParams = [{ value: 10, name: "Label1" }];
    expect(formatter(mockParams as any)).toBeDefined();
  });

  it("should return correct grid configuration", () => {
    const options = useEmploymentBreakdownChartOptions(mockData);
    expect(options.grid.top).toBe("15%");
    expect(options.grid.left).toBe("1%");
    expect(options.grid.right).toBe("5%");
  });

  it("should return correct xAxis configuration", () => {
    const options = useEmploymentBreakdownChartOptions(mockData);
    expect(options.xAxis.type).toBe("value");
    expect(options.xAxis.boundaryGap).toEqual([0, 0.01]);
    expect(options.xAxis.axisLine.show).toBe(true);
    expect(options.xAxis.axisTick.show).toBe(false);
    expect(options.xAxis.splitLine.show).toBe(false);
  });

  it("should return correct yAxis configuration", () => {
    const options = useEmploymentBreakdownChartOptions(mockData);
    expect(options.yAxis.type).toBe("category");
    expect(options.yAxis.data).toEqual(mockData.labels);
    expect(options.yAxis.axisLine.show).toBe(false);
    expect(options.yAxis.axisTick.show).toBe(false);
  });

  it("should return correct series configuration", () => {
    const options = useEmploymentBreakdownChartOptions(mockData);
    const series = options.series[0];
    expect(series.type).toBe("bar");
    expect(series.data).toEqual(mockData.values);
    expect(series.itemStyle.borderRadius).toEqual([5]);
    expect(series.itemStyle.color({ dataIndex: 0 })).toBe("#FF0000");
    expect(series.itemStyle.color({ dataIndex: 1 })).toBe("#00FF00");
    expect(series.itemStyle.color({ dataIndex: 2 })).toBe("#0000FF");
    expect(series.barWidth).toBe("100%");
  });
});
