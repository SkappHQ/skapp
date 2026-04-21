import { theme } from "~community/common/theme/theme";

export default function GraphTooltip(value: number, label: string): string {
  return `<div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center;">
                <div style="font-family: var(--app-font); font-style: normal; font-size: 0.75rem; font-weight: 400; color: #000; margin-right: 0.5rem;">${String(value)}</div>
                <div style="height: 1.375rem; background-color: ${theme.palette.trendChart.tooltip.background}; border-radius: 3.875rem; padding: 0.125rem 0.5625rem;">
                  <div style="font-family: var(--app-font); font-style: normal; font-size: 0.625rem; font-weight: 400; color: ${theme.palette.trendChart.tooltip.color};">${label}</div>
                </div>
              </div>
            </div>
          </div>`;
}
