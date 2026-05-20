import { FC } from "react";

import { Card } from "@rootcodelabs/skapp-ui";
import { MetricItem } from "~community/crm/types/CommonTypes";

interface Props {
  metrics: MetricItem[];
}

const CompanyMetricCards: FC<Props> = ({ metrics }) => {
  return (
    <div className="flex gap-4 w-full">
      {metrics.map((metric) => (
        <Card
          key={metric.title}
          className="flex flex-col gap-1 flex-1 min-w-0 p-3 overflow-hidden border border-secondary-accent rounded-lg"
        >
          <p className="text-sm font-normal leading-5 text-secondary-text">
            {metric.title}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold leading-6 text-black">
              {metric.amount}
            </p>
            {metric.chip && (
              <span
                className="inline-flex items-center gap-1 rounded-[30px] px-3 py-0.5 text-xs font-medium whitespace-nowrap"
                style={{ backgroundColor: metric.chip.bgColor, color: metric.chip.color }}
              >
                {metric.chip.icon}
                {metric.chip.label}
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CompanyMetricCards;
