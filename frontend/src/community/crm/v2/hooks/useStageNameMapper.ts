import { useTranslator } from "~community/common/hooks/useTranslator";
import { getStageDisplayName } from "~community/configurations/utils/stageUtil";

interface UseStageNameMapperReturn {
  getStageByName: (name: string) => string;
}

export const useStageNameMapper = (): UseStageNameMapperReturn => {
  const translateStageName = useTranslator(
    "crmModuleV2",
    "deals",
    "defaultStageNames"
  );

  const getStageByName = (name: string): string =>
    getStageDisplayName(name, translateStageName);

  return { getStageByName };
};
