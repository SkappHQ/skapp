import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityRow } from "~community/crm/activities/types/activityTypes";
import {
  getRowSubtitle,
  isRowOverdue
} from "~community/crm/activities/utils/activityFeedUtil";

interface ActivityRowSubtitleProps {
  id: string;
  row: ActivityRow;
  isCompletedStyleApplied: boolean;
  timeZone?: string;
}

const ActivityRowSubtitle: FC<ActivityRowSubtitleProps> = ({
  id,
  row,
  isCompletedStyleApplied,
  timeZone
}) => {
  const translateText = useTranslator("crmModule");

  const status = getRowSubtitle(row, translateText, timeZone);

  if (!status) return null;

  const statusColor = isRowOverdue(row, timeZone)
    ? "text-semantic-red-text"
    : isCompletedStyleApplied
      ? "text-secondary-icon"
      : "text-secondary-text";

  return (
    <p
      id={id}
      className={`body3 leading-none mt-0.5 truncate ${statusColor} ${
        isCompletedStyleApplied ? "line-through" : ""
      }`}
    >
      {status}
    </p>
  );
};

export default ActivityRowSubtitle;
