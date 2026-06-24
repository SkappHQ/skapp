import { useCallback } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { DEFAULT_STAGE_NAME_MAP } from "~community/crm/constants/stageConstants";

const useStageNameMapper = () => {
  const translateText = useTranslator(
    "crmModule",
    "deals",
    "defaultStageNames"
  );

  const getStageByName = useCallback(
    (name: string): string => {
      const mappedLabel = DEFAULT_STAGE_NAME_MAP[name];

      if (!mappedLabel) {
        return name;
      }

      return translateText([name]) || mappedLabel;
    },
    [translateText]
  );

  return { getStageByName };
};

export default useStageNameMapper;
