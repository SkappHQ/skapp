import { useTranslator } from "~community/common/hooks/useTranslator";
import { DEFAULT_STAGE_NAMES } from "~community/crm/constants/stageConstants";

const useStageNameMapper = () => {
  const translateText = useTranslator(
    "crmModule",
    "deals",
    "defaultStageNames"
  );

  const getStageByName = (name: string): string =>
    DEFAULT_STAGE_NAMES.has(name) ? translateText([name]) : name;

  return { getStageByName };
};

export default useStageNameMapper;
