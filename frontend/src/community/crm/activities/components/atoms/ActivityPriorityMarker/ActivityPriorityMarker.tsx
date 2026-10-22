import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ACTIVITY_PRIORITY_CONFIG } from "~community/crm/activities/constants/activityIconConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";

interface ActivityPriorityMarkerProps {
  priority: CrmPriorityEnum;
}

const ActivityPriorityMarker: FC<ActivityPriorityMarkerProps> = ({
  priority
}) => {
  const translateAria = useTranslator("crmAria");
  const { ariaKey, backgroundClass, textClass, Icon } =
    ACTIVITY_PRIORITY_CONFIG[priority];

  return (
    <span
      role="img"
      aria-label={translateAria(["activities", "row", ariaKey])}
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full ${backgroundClass} ${textClass}`}
    >
      <Icon size={16} />
    </span>
  );
};

export default ActivityPriorityMarker;
