import { useMemo } from "react";

import { useGetDealStages } from "~community/crm/api/crmDealApi";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";

const useGetStageOptions = () => {
  const { getStageByName } = useStageNameMapper();

  const { data: stages = [], isLoading, isError } = useGetDealStages();

  const leadStageId = useMemo(
    () => stages.find((s) => s.stageType === CrmDealStageEnum.INITIAL)?.id,
    [stages]
  );

  const options = useMemo(
    () =>
      stages.map((stage) => ({
        id: String(stage.id),
        value: String(stage.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: STAGE_COLOR_MAP[stage.color]
              }}
            />
            <span className="body2">{getStageByName(stage.name)}</span>
          </div>
        )
      })),
    [stages, getStageByName]
  );

  return {
    stages,
    options,
    leadStageId,
    isLoading,
    isError
  };
};

export default useGetStageOptions;
