import { FC, JSX } from "react";

import CompanyMetricCard from "~community/crm/components/atoms/CompanyMetricCard/CompanyMetricCard";

interface ChipProps {
  label: string;
  color?: string;
  bgColor?: string;
  icon?: JSX.Element;
}

interface MetricItem {
  title: string;
  amount: string;
  chip?: ChipProps;
}

interface Props {
  metrics: MetricItem[];
}

const CompanyMetricCards: FC<Props> = ({ metrics }) => {
  return (
    <div className="flex gap-4 w-full">
      {metrics.map((metric, index) => (
        <CompanyMetricCard
          key={index}
          title={metric.title}
          amount={metric.amount}
          chip={metric.chip}
        />
      ))}
    </div>
  );
};

export default CompanyMetricCards;
