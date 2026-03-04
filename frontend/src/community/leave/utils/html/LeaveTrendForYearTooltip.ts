import { theme } from "~community/common/theme/theme";
import { MultipleTooltipFormatterParams } from "~community/common/types/EchartTypes";

const LeaveTrendForYearTooltip = (
  paramsFilteredByValue: MultipleTooltipFormatterParams
): string => `<div>
  ${paramsFilteredByValue
    ?.map(
      (el) => `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center;">
        <div style="font-family: var(--app-font); font-style: normal; font-size: 24px; font-weight: 400; color: ${
          theme.palette.common.black
        };line-height: 32px; margin-right: 8px;">${String(el.value)}</div>
        <div style="display: flex; align-items: center; height: 25px; background-color: ${
          theme.palette.grey[100]
        }; border-radius: 62px; padding: 2px 9px;">
          <div style="height: 8px; width: 8px; background-color: ${String(
            el.color
          )}; margin-right: 8px;"></div>
          <div style="font-family: var(--app-font); font-style: normal; font-size: 12px; font-weight: 400; line-height: 16px;">${String(
            el.seriesName
          )}</div>
        </div>
      </div>
    </div>
  `
    )
    .join("")}
</div>`;

export default LeaveTrendForYearTooltip;
