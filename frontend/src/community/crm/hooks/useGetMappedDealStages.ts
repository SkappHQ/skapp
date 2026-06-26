import { useMemo } from "react";

import { useGetDealStages } from "~community/crm/api/crmDealApi";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";

const useGetMappedDealStages = () => {
  const { getStageByName } = useStageNameMapper();

  const { data: stages = [], isLoading, isError } = useGetDealStages();

  const initialStageId = useMemo(
    () => stages.find((s) => s.stageType === CrmDealStageEnum.INITIAL)?.id,
    [stages]
  );

  const dealStages = useMemo(
    () =>
      stages.map((stage) => ({
        ...stage,
        name: getStageByName(stage.name)
      })),
    [stages, getStageByName]
  );

  return {
    stages,
    dealStages,
    initialStageId,
    isLoading,
    isError
  };
};

export default useGetMappedDealStages;
