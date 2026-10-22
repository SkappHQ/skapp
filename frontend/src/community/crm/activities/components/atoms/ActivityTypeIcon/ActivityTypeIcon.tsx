import { Tooltip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  ACTIVITY_TYPE_ICON_SIZE,
  ACTIVITY_TYPE_LABEL_KEYS
} from "~community/crm/activities/constants/activityConstants";
import { ACTIVITY_TYPE_ICON_MAP } from "~community/crm/activities/constants/activityIconConstants";
import { ActivityType } from "~community/crm/activities/types/activityTypes";

interface ActivityTypeIconProps {
  id: string;
  type: ActivityType;
  size?: number;
}

const ActivityTypeIcon: FC<ActivityTypeIconProps> = ({
  id,
  type,
  size = ACTIVITY_TYPE_ICON_SIZE
}) => {
  const translateText = useTranslator("crmModule");

  const Icon = ACTIVITY_TYPE_ICON_MAP[type];
  const label = translateText([
    "activities",
    "types",
    ACTIVITY_TYPE_LABEL_KEYS[type]
  ]);

  return (
    <Tooltip id={`${id}-tooltip`} content={label}>
      <span id={id} className="inline-flex shrink-0">
        <Icon width={size} height={size} aria-hidden="true" focusable="false" />
        <span className="sr-only">{label}</span>
      </span>
    </Tooltip>
  );
};

export default ActivityTypeIcon;
