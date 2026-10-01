import { useTranslator } from "~community/common/hooks/useTranslator";
import { getIndustryDisplayName } from "~community/crm/utils/companyUtil";

interface UseIndustryNameMapperReturn {
  getIndustryByName: (name: string) => string;
}

export const useIndustryNameMapper = (): UseIndustryNameMapperReturn => {
  const translateIndustryName = useTranslator(
    "crmModule",
    "companies",
    "industryOptions"
  );

  const getIndustryByName = (name: string): string =>
    getIndustryDisplayName(name, translateIndustryName);

  return { getIndustryByName };
};
