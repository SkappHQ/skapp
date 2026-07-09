import { TranslatorFunctionType } from "~community/common/types/CommonTypes";

import {
  CrmCompanyDetailType,
  CrmCompanyRelationsUpdate,
  MetricItem
} from "../types/CommonTypes";

export const mergeCompanyUpdate = (
  companies: CrmCompanyDetailType[],
  update: CrmCompanyRelationsUpdate
): CrmCompanyDetailType[] =>
  companies.map((company) =>
    company.id === update.id ? { ...company, ...update } : company
  );

export const mapCompanyToMetricItems = (
  company: CrmCompanyDetailType,
  translateText: TranslatorFunctionType
): MetricItem[] => {
  return [
    {
      id: "accountValue",
      title: translateText(["metrics", "accountValue"]),
      amount: String(company.accountValue),
      isCurrency: true
    },
    {
      id: "openDeals",
      title: translateText(["metrics", "openDeals"]),
      amount: String(company.openDeals)
    },
    {
      id: "closedDeals",
      title: translateText(["metrics", "closedDeals"]),
      amount: String(company.closedDeals)
    }
  ];
};
