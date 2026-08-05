import { FC } from "react";

import StageDot from "~community/crm/components/atoms/StageDot/StageDot";
import { CrmDealStageColorsEnum } from "~community/crm/enums/common";

interface StageLabelProps {
  label: string;
  color: CrmDealStageColorsEnum;
}

const StageLabel: FC<StageLabelProps> = ({ label, color }) => (
  <div className="flex min-w-0 max-w-full items-center gap-2">
    <StageDot color={color} />
    <span className="body2 min-w-0 truncate" title={label}>
      {label}
    </span>
  </div>
);

export default StageLabel;
