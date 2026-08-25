import { useCallback } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { DefaultStageNameEnum } from "~community/crm/v2/enums/common";

const useStageNameMapper = () => {
  const translateText = useTranslator(
    "crmModule",
    "deals",
    "defaultStageNames"
  );

  const getStageDisplayName = useCallback(
    (stageName?: string) => {
      if (stageName !== undefined) {
        return stageName in DefaultStageNameEnum
          ? translateText([stageName])
          : stageName;
      }
    },
    [translateText]
  );

  return { getStageDisplayName };
};

export default useStageNameMapper;
