import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { CrmIndustryEnum } from "~community/crm/enums/common";

import {
  CrmCompany,
  CrmCompanyFormTypes,
  MetricItem
} from "../types/CommonTypes";

export const getCompanyFormInitialValues = (
  company?: CrmCompany
): CrmCompanyFormTypes => ({
  name: company?.name || "",
  industry: company?.industry || CrmIndustryEnum.NONE,
  website: company?.website || "",
  address: company?.address || "",
  contactNumber: company?.contactNumber || ""
});

export const mergeCompanyUpdate = (
  companies: CrmCompany[],
  update: CrmCompany
): CrmCompany[] =>
  companies.map((company) =>
    company.id === update.id ? { ...company, ...update } : company
  );

export const withIncrementedOpenDeals = (
  companies: CrmCompany[],
  companyId: number
): CrmCompany[] =>
  companies.map((company) =>
    company.id === companyId
      ? { ...company, openDeals: company.openDeals + 1 }
      : company
  );

export const mapCompanyToMetricItems = (
  company: CrmCompany,
  translateText: TranslatorFunctionType
): MetricItem[] => {
  return [
    {
      id: "accountValue",
      title: translateText(["metrics", "accountValue"]),
      amount: String(company.accountValue ?? 0),
      isCurrency: true
    },
    {
      id: "openDeals",
      title: translateText(["metrics", "openDeals"]),
      amount: String(company.openDeals ?? 0)
    },
    {
      id: "closedDeals",
      title: translateText(["metrics", "closedDeals"]),
      amount: String(company.closedDeals ?? 0)
    }
  ];
};
