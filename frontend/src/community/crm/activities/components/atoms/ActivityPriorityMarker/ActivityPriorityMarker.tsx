import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { getPriorityConfig } from "~community/crm/utils/priorityUtil";

interface ActivityPriorityMarkerProps {
  priority: CrmPriorityEnum;
}

const ActivityPriorityMarker: FC<ActivityPriorityMarkerProps> = ({
  priority
}) => {
  const translateAria = useTranslator("crmAria");
  const { key } = getPriorityConfig(priority);

  return (
    <span
      role="img"
      aria-label={translateAria(["activities", "row", `${key}Priority`])}
      className="inline-flex shrink-0"
    >
      <PriorityLabel priority={priority} />
    </span>
  );
};

export default ActivityPriorityMarker;
