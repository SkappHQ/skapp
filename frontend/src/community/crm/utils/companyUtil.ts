import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

import { CrmCompany, MetricItem } from "../types/CommonTypes";

export const mergeCompanyUpdate = (
  companies: CrmCompany[],
  update: CrmCompany
): CrmCompany[] =>
  companies.map((company) =>
    company.id === update.id ? { ...company, ...update } : company
  );

export const reconcileCompanies = (
  existing: CrmCompany[],
  incoming: CrmCompany[]
): CrmCompany[] =>
  incoming.map((item) => {
    const enriched = existing.find((company) => company.id === item.id);
    return enriched ? { ...item, ...enriched } : item;
  });

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
