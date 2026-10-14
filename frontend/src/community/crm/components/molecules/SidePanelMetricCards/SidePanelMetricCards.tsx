import { Card, Label } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmMetricLabelThemeEnum } from "~community/crm/enums/common";
import { formatMonetaryValueWithDecimals } from "~community/crm/utils/commonUtil";
import { CrmMetricItem } from "~community/crm/utils/companyUtil";

interface SidePanelMetricCardsProps {
  metrics: CrmMetricItem[];
}

const SidePanelMetricCards: FC<SidePanelMetricCardsProps> = ({ metrics }) => {
  return (
    <div className="flex w-full gap-4">
      {metrics.map((metric) => (
        <Card
          key={metric.id}
          className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden rounded-lg border border-secondary-accent bg-white p-3"
        >
          <p className="body2 text-secondary-text">{metric.title}</p>
          <div className="flex items-center gap-2">
            <p className="subtitle2">
              {metric.isCurrency
                ? formatMonetaryValueWithDecimals(metric.amount)
                : metric.amount}
            </p>
            {metric.chip && (
              <Label
                backgroundColor={
                  metric.chip.variant === CrmMetricLabelThemeEnum.GREEN
                    ? "bg-semantic-green-background"
                    : "bg-semantic-red-background"
                }
                textColor={
                  metric.chip.variant === CrmMetricLabelThemeEnum.GREEN
                    ? "text-semantic-green-text"
                    : "text-semantic-red-text"
                }
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
