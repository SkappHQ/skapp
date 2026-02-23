import { theme } from "~community/common/theme/theme";
import {
  MultipleTooltipFormatterParams,
  SingleTooltipFormatterParams
} from "~community/common/types/EchartTypes";

export default function LeaveTypeBreakdownTooltip(
  params: MultipleTooltipFormatterParams
): string {
  const toolTipContent = (): Array<string> => {
    return params?.map(
      (item: SingleTooltipFormatterParams) => `<div>
    <div style="display: flex; justify-content: space-between; align-items: center;  padding: 0.3rem 0rem;">
      <div style="display: flex; align-items: center; justify-content: space-between">
        <div style="font-family: Inter; font-style: normal; font-size: 1rem; font-weight: 700; color: #000;line-height: 1rem; margin-right: 0.5rem;">${String(
          item.data
        )}</div>
        <div style="display: flex; align-items: center; height: 1.563rem; background-color: ${
          theme.palette.grey[100]
        }; border-radius: 3.875rem; padding: 0.125rem 0.563rem;">
        <div style="height: 0.5rem; width: 0.5rem; background-color: ${String(
          item.color
        )}; margin-right: 0.5rem;"></div>
        <div style="font-family: Inter; font-style: normal; font-size: 0.75rem; font-weight: 400; line-height: 1rem;">${String(
          item.seriesName
        )}</div>
        </div>
      </div>
      </div>`
    );
  };

  return `<div style="padding: 0.4rem; width: fit-content; display: flex; justify-content: space-between">${toolTipContent().join(
    ""
  )}</div>`;
}
