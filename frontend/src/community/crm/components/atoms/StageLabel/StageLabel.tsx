import { FC } from "react";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageColorsEnum } from "~community/crm/enums/common";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";

interface StageLabelProps {
  name: string;
  color: CrmDealStageColorsEnum;
}

const StageLabel: FC<StageLabelProps> = ({ name, color }) => {
  const { getStageByName } = useStageNameMapper();

  const stageName = getStageByName(name);

  return (
    <div className="flex min-w-0 max-w-full items-center gap-2">
      <div
        className="size-2 rounded-full shrink-0"
        style={{ backgroundColor: STAGE_COLOR_MAP[color] }}
      />
      <span className="body2 min-w-0 truncate" title={stageName}>
        {stageName}
      </span>
    </div>
  );
};

export default StageLabel;
