import { renderHook } from "@testing-library/react";

import { useJobFamilyOverviewChartOptions } from "./jobFamilyOverviewChartOptions";

describe("useJobFamilyOverviewChartOptions", () => {
  it("should return chart options with the correct structure", () => {
    const data = [{ name: "Engineering", value: 50, jobTitles: ["Engineer"] }];

    const { result } = renderHook(() => useJobFamilyOverviewChartOptions(data));

    expect(result.current).toHaveProperty("tooltip");
    expect(result.current).toHaveProperty("grid");
    expect(result.current).toHaveProperty("legend");
    expect(result.current.series).toHaveLength(1);
    expect(result.current.series[0]).toHaveProperty("type", "pie");
  });
});
