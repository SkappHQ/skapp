import { createTheme } from "@mui/material/styles";
import { renderHook } from "@testing-library/react";

import { useGenderDistributionChartOptions } from "./genderDistributionChartOptions";

describe("useGenderDistributionChartOptions", () => {
  it("should return chart options with the correct structure", () => {
    const theme = createTheme();

    const { result } = renderHook(() =>
      useGenderDistributionChartOptions([{ name: "Male", value: 60 }])
    );

    expect(result.current).toHaveProperty("tooltip");
    expect(result.current).toHaveProperty("grid");
    expect(result.current).toHaveProperty("legend");
    expect(result.current.series).toHaveLength(1);
    expect(result.current.series[0]).toHaveProperty("type", "pie");
  });
});
