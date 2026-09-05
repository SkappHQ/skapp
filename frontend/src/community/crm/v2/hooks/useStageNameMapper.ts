import { useTranslator } from "~community/common/hooks/useTranslator";
import { DefaultStageNameEnum } from "~community/crm/v2/enums/common";

const useStageNameMapper = () => {
  const translateText = useTranslator(
    "crmModule",
    "deals",
    "defaultStageNames"
  );

  const getStageDisplayName = (stageName?: string) => {
    if (stageName !== undefined) {
      return Object.values<string>(DefaultStageNameEnum).includes(stageName)
        ? translateText([stageName])
        : stageName;
    }
  };

  return { getStageDisplayName };
};

export default useStageNameMapper;
