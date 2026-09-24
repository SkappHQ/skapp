import { useTranslator } from "~community/common/hooks/useTranslator";
import { INDUSTRY_OPTION_KEYS } from "~community/crm/v2/constants/companyConstants";
import { CrmIndustryEnum } from "~community/crm/v2/enums/common";

export const useGetIndustryOptions = () => {
  const translateText = useTranslator("crmModuleV2");

  const getIndustryLabel = (industry: CrmIndustryEnum): string =>
    translateText([
      "companies",
      "industryOptions",
      INDUSTRY_OPTION_KEYS[industry]
    ]);

  const industryOptions = Object.values(CrmIndustryEnum).map((industry) => ({
    id: industry,
    value: industry,
    label: getIndustryLabel(industry)
  }));

  return { industryOptions, getIndustryLabel };
};
