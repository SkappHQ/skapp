import { theme } from "~community/common/theme/theme";

import JobFamilyOverviewGraphTooltip from "./JobFamilyOverviewGraphTooltip";

describe("JobFamilyOverviewGraphTooltip", () => {
  it("should generate correct tooltip HTML for given inputs", () => {
    const value = 100;
    const label = "Job Family";
    const jobTitles = [
      { name: "Engineer", value: 50 },
      { name: "Manager", value: 30 }
    ];

    const result = JobFamilyOverviewGraphTooltip(value, label, jobTitles);

    expect(result).toContain(
      `<div style="font-family: var(--app-font); font-style: normal; font-size: 1.5rem; font-weight: 400; color: #000; margin-right: 0.5rem;">100</div>`
    );
    expect(result).toContain(
      `<div style="font-family: var(--app-font); font-style: normal; font-size: 0.875rem; font-weight: 400; color: ${theme.palette.trendChart.tooltip.color};">Job Family</div>`
    );
  });

  it("should handle empty jobTitles array gracefully", () => {
    const value = 200;
    const label = "Empty Job Family";
    const jobTitles: { name: string; value: number }[] = [];

    const result = JobFamilyOverviewGraphTooltip(value, label, jobTitles);

    expect(result).toContain(
      `<div style="font-family: var(--app-font); font-style: normal; font-size: 1.5rem; font-weight: 400; color: #000; margin-right: 0.5rem;">200</div>`
    );
    expect(result).toContain(
      `<div style="font-family: var(--app-font); font-style: normal; font-size: 0.875rem; font-weight: 400; color: ${theme.palette.trendChart.tooltip.color};">Empty Job Family</div>`
    );
    expect(result).not.toContain(
      `<div style="font-family: var(--app-font); font-size: 1rem; font-weight: 400; color: #000; margin-right: 0.5rem;">`
    );
  });

  it("should handle null or undefined jobTitles gracefully", () => {
    const value = 300;
    const label = "No Job Titles";
    const jobTitles = null;

    const result = JobFamilyOverviewGraphTooltip(
      value,
      label,
      jobTitles as any
    );

    expect(result).toContain(
      `<div style="font-family: var(--app-font); font-style: normal; font-size: 1.5rem; font-weight: 400; color: #000; margin-right: 0.5rem;">300</div>`
    );
    expect(result).toContain(
      `<div style="font-family: var(--app-font); font-style: normal; font-size: 0.875rem; font-weight: 400; color: ${theme.palette.trendChart.tooltip.color};">No Job Titles</div>`
    );
    expect(result).not.toContain(
      `<div style="font-family: var(--app-font); font-size: 1rem; font-weight: 400; color: #000; margin-right: 0.5rem;">`
    );
  });
});
