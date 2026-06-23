import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetDealStages } from "~community/crm/api/crmDealApi";
import { DEFAULT_STAGE_NAME_MAP } from "~community/crm/constants/stageConstants";

const useGetDealStageOptions = () => {
  const translateText = useTranslator(
    "crmModule",
    "deals",
    "defaultStageNames"
  );

  const { data: stages, isPending } = useGetDealStages();

  const options = useMemo(
    () =>
      stages?.map((stage) => ({
        ...stage,
        name: DEFAULT_STAGE_NAME_MAP[stage.name]
          ? translateText([stage.name])
          : stage.name
      })) ?? [],
    [stages, translateText]
  );

  const getStageByName = (name: string) =>
    DEFAULT_STAGE_NAME_MAP[name] ? translateText([name]) : name;

  return { options, getStageByName, isPending };
};

export default useGetDealStageOptions;
