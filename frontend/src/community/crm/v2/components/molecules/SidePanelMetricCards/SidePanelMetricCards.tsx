import { Card } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { formatMonetaryValueWithDecimals } from "~community/crm/v2/utils/commonUtil";
import { CrmMetricItem } from "~community/crm/v2/utils/companyUtil";

interface SidePanelMetricCardsProps {
  metrics: CrmMetricItem[];
}

const SidePanelMetricCards: FC<SidePanelMetricCardsProps> = ({ metrics }) => {
  return (
    <div className="flex gap-4 w-full">
      {metrics.map((metric) => (
        <Card
          key={metric.id}
          className="flex flex-col gap-1 flex-1 min-w-0 p-3 overflow-hidden border border-secondary-accent rounded-lg bg-white"
        >
          <p className="body2 text-secondary-text">{metric.title}</p>
          <div className="flex items-center gap-2">
            <p className="subtitle2">
              {metric.isCurrency
                ? formatMonetaryValueWithDecimals(metric.amount)
                : metric.amount}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SidePanelMetricCards;
