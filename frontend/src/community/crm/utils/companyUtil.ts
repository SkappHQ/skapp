import { CrmCompanyMetricsType, MetricItem } from "../types/CommonTypes";

export const mapCompanyToMetricItems = (
  company: CrmCompanyMetricsType,
  translateText: (
    keys: string[],
    interpolationValues?: Record<string, any>
  ) => string
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
