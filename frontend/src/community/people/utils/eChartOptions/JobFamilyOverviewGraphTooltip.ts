import { theme } from "~community/common/theme/theme";

export default function JobFamilyOverviewGraphTooltip(
  value: number,
  label: string,
  jobTitles: { name: string; value: number }[]
): string {
  return `<div>
            <div>
              <div style="display: flex; align-items: center;margin-bottom:1rem">
                <div style="font-family: var(--app-font); font-style: normal; font-size: 1.5rem; font-weight: 400; color: #000; margin-right: 0.5rem;">${String(value)}</div>
                <div style="font-family: var(--app-font); font-style: normal; font-size: 0.875rem; font-weight: 400; color: ${theme.palette.trendChart.tooltip.color};">${label}</div>
              </div>
              ${jobTitles
                ?.map(
                  (item) =>
                    `<div style="display: block; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center;">
            <div style="font-family: var(--app-font); font-size: 1rem; font-weight: 400; color: #000; margin-right: 0.5rem;">
              ${item.value}
            </div>
            <div style="height: 1.375rem; background-color: ${theme.palette.trendChart.tooltip.background}; border-radius: 1.875rem; padding: 0.125rem 0.5625rem;">
              <div style="font-family: var(--app-font); font-size: 0.75rem; font-weight: 400; color: ${theme.palette.trendChart.tooltip.color};">
                ${item.name}
              </div>
            </div>
          </div>
        </div>`
                )
                .join("")}
            </div>
          </div>`;
}
