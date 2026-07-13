import { useCallback } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { DefaultStageNameEnum } from "~community/crm/enums/common";

const useStageNameMapper = () => {
  const translateText = useTranslator(
    "crmModule",
    "deals",
    "defaultStageNames"
  );

  const getStageByName = useCallback(
    (name: string): string =>
      Object.values(DefaultStageNameEnum).includes(name as DefaultStageNameEnum)
        ? translateText([name])
        : name,
    []
  );

  return { getStageByName };
};

export default useStageNameMapper;
