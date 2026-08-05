import { FC } from "react";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageColorsEnum } from "~community/crm/enums/common";

interface StageDotProps {
  color: CrmDealStageColorsEnum;
}

const StageDot: FC<StageDotProps> = ({ color }) => (
  <span
    className="inline-block size-2 shrink-0 rounded-full"
    style={{ backgroundColor: STAGE_COLOR_MAP[color] }}
  />
);

export default StageDot;
