import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetDealStages } from "~community/crm/api/crmDealApi";
import { DEFAULT_STAGE_NAME_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

const useGetStageOptions = () => {
  const translateText = useTranslator(
    "crmModule",
    "deals",
    "defaultStageNames"
  );

  const { data: stages } = useGetDealStages();

  const getStageById = (id: number): CrmDealStageType | undefined =>
    stages?.find((s) => s.id === id);

  const getStageByName = (name: string): string => {
    const isDefaultStage = DEFAULT_STAGE_NAME_MAP[name];

    return isDefaultStage ? translateText([name]) : name;
  };

  const options = useMemo(
    () =>
      (stages ?? []).map((stage) => ({
        id: stage.id.toString(),
        label: getStageByName(stage.name),
        value: stage.id.toString()
      })),
    [stages]
  );

  return { options, getStageById, getStageByName };
};

export default useGetStageOptions;
