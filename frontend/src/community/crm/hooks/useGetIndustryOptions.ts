import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { INDUSTRY_OPTION_KEYS } from "~community/crm/constants/companyConstants";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import { CrmIndustryOption } from "~community/crm/types/CrmTypes";
import { getIndustryDisplayName } from "~community/crm/utils/companyUtil";

interface UseGetIndustryOptionsReturn {
  industryOptions: CrmIndustryOption[];
  getIndustryLabel: (industryId?: number | null) => string;
}

export const useGetIndustryOptions = (): UseGetIndustryOptionsReturn => {
  const translateIndustryName = useTranslator(
    "crmModule",
    "companies",
    "industryOptions"
  );

  const { industries } = useCrmStore(
    useShallow((store) => ({
      industries: store.industries
    }))
  );

  const noneLabel = translateIndustryName([
    INDUSTRY_OPTION_KEYS[CrmIndustryEnum.NONE]
  ]);

  const getIndustryLabel = (industryId?: number | null): string => {
    const industry = industryId != null ? industries[industryId] : undefined;
    return industry
      ? getIndustryDisplayName(industry.name, translateIndustryName)
      : noneLabel;
  };

  const industryOptions: CrmIndustryOption[] = [
    { id: "", value: "", label: noneLabel },
    ...Object.values(industries).map((industry) => ({
      id: String(industry.id),
      value: String(industry.id),
      label: getIndustryDisplayName(industry.name, translateIndustryName)
    }))
  ];

  return { industryOptions, getIndustryLabel };
};
