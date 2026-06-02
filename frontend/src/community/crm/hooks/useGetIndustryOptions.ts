import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmIndustryEnum } from "~community/crm/enums/common";

const useGetIndustryOptions = () => {
  const translateIndustryOptions = useTranslator(
    "crmModule",
    "companies",
    "industryOptions"
  );

  return useMemo(
    () =>
      Object.values(CrmIndustryEnum).map((industry) => ({
        id: industry,
        label: translateIndustryOptions([industry]),
        value: industry
      })),
    [translateIndustryOptions]
  );
};

export default useGetIndustryOptions;
