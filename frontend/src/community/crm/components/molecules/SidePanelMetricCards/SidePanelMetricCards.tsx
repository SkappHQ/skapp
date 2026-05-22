import { FC } from "react";

import { Card } from "@rootcodelabs/skapp-ui";
import { MetricItem } from "~community/crm/types/CommonTypes";
import { getChipStyles } from "~community/crm/utils/crmMetricUtils";
import { formatValue } from "~community/crm/utils/companyTableHelpers";

interface Props {
  metrics: MetricItem[];
}

const SidePanelMetricCards: FC<Props> = ({ metrics }) => {
  return (
    <div className="flex gap-4 w-full">
      {metrics.map((metric) => (
        <Card
          key={metric.title}
          className="flex flex-col gap-1 flex-1 min-w-0 p-3 overflow-hidden border border-secondary-accent rounded-lg bg-white"
        >
          <p className="body2 text-secondary-text">
            {metric.title}
          </p>
          <div className="flex items-center gap-2">
            <p className="subtitle2 text-black">
              {metric.isCurrency ? formatValue(metric.amount as string | number) : metric.amount}
            </p>
            {metric.chip && (
              <span
                className={`inline-flex items-center gap-1 rounded-[30px] px-3 py-0.5 text-xs font-medium whitespace-nowrap ${getChipStyles(metric.chip.theme)}`}
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

export default SidePanelMetricCards;
