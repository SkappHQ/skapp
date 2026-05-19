import { FC } from "react";

import CompanyMetricCard from "~community/crm/components/atoms/CompanyMetricCard/CompanyMetricCard";
import { MetricItem } from "~community/crm/types/CommonTypes";

interface Props {
  metrics: MetricItem[];
}

const CompanyMetricCards: FC<Props> = ({ metrics }) => {
  return (
    <div className="flex gap-4 w-full">
      {metrics.map((metric) => (
        <CompanyMetricCard
          key={metric.title}
          title={metric.title}
          amount={metric.amount}
          chip={metric.chip}
        />
      ))}
    </div>
  );
};

export default CompanyMetricCards;
