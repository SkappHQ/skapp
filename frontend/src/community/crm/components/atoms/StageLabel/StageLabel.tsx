import { FC } from "react";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageColorsEnum } from "~community/crm/enums/common";

interface StageLabelProps {
  label: string;
  color: CrmDealStageColorsEnum;
}

const StageLabel: FC<StageLabelProps> = ({ label, color }) => (
  <div className="flex min-w-0 max-w-full items-center gap-2">
    <div
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: STAGE_COLOR_MAP[color] }}
    />
    <span className="body2 min-w-0 truncate" title={label}>
      {label}
    </span>
  </div>
);

export default StageLabel;
