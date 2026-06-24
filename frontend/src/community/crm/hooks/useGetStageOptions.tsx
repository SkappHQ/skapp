import { useMemo } from "react";

import { useGetDealStages } from "~community/crm/api/crmDealApi";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

import { CrmDealStageEnum } from "../enums/common";

const useGetStageOptions = () => {
  const { getStageByName } = useStageNameMapper();

  const { data: stages = [], isLoading, isError } = useGetDealStages();

  const getStageById = (id: number): CrmDealStageType | undefined =>
    stages.find((s) => s.id === id);

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
    [stages]
  );

  return {
    stages,
    options,
    getStageById,
    leadStageId,
    isLoading,
    isError
  };
};

export default useGetStageOptions;
