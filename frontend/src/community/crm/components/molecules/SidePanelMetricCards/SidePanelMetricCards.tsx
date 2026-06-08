import { FC } from "react";

import { Card, Label } from "@rootcodelabs/skapp-ui";
import { MetricItem } from "~community/crm/types/CommonTypes";
import { getLabelStyles } from "~community/crm/utils/crmMetricUtils";
import { formatValue } from "~community/crm/utils/crmUtil";

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
            <p className="subtitle2">
              {metric.isCurrency ? formatValue(metric.amount) : metric.amount}
            </p>
            {metric.chip && (
              <Label
                backgroundColor={getLabelStyles(metric.chip.theme).backgroundColor}
                textColor={getLabelStyles(metric.chip.theme).textColor}
              >
                {metric.chip.label}
              </Label>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SidePanelMetricCards;
