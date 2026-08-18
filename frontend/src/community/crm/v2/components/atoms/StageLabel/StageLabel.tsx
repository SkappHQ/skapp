import { FC } from "react";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageColorsEnum as CrmDealStageColorsEnumV1 } from "~community/crm/enums/common";
import { CrmDealStageColorsEnum } from "~community/crm/v2/enums/common";

interface StageLabelProps {
  label: string;
  color?: CrmDealStageColorsEnum;
}

// v1 and v2 CrmDealStageColorsEnum share identical values; bridge the nominal
// type so the shared STAGE_COLOR_MAP stays a single source of truth.
const StageLabel: FC<StageLabelProps> = ({ label, color }) => (
  <div className="flex min-w-0 max-w-50 items-center gap-2">
    <div
      className="size-2 shrink-0 rounded-full"
      style={{
        backgroundColor: color
          ? STAGE_COLOR_MAP[color as unknown as CrmDealStageColorsEnumV1]
          : undefined
      }}
    />
    <span className="body2 min-w-0 truncate" title={label}>
      {label}
    </span>
  </div>
);

export default StageLabel;
