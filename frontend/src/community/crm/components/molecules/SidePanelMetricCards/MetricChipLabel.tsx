import { Label } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { MetricChip } from "~community/crm/types/CommonTypes";
import { getLabelStyles } from "~community/crm/utils/crmMetricUtils";

interface Props {
  chip: MetricChip;
}

const MetricChipLabel: FC<Props> = ({ chip }) => {
  const { backgroundColor, textColor } = getLabelStyles(chip.variant);

  return (
    <Label backgroundColor={backgroundColor} textColor={textColor}>
      <span className="flex items-center gap-1">
        {chip.icon}
        {chip.label}
      </span>
    </Label>
  );
};

export default MetricChipLabel;
