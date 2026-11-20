import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ACTIVITY_TYPE_ICON_MAP } from "~community/crm/activities/constants/activityConstants";
import { ActivityType } from "~community/crm/activities/types/activityTypes";

interface ActivityTypeIconProps {
  id: string;
  type: ActivityType;
}

const ActivityTypeIcon: FC<ActivityTypeIconProps> = ({ id, type }) => {
  const translateText = useTranslator("crmModule");

  const Icon = ACTIVITY_TYPE_ICON_MAP[type];
  const label = translateText(["activities", "types", type.toLowerCase()]);

  return (
    <span id={id} className="flex shrink-0">
      <Icon role="img" aria-label={label} />
    </span>
  );
};

export default ActivityTypeIcon;
