import { FC } from "react";

import ActivityRow from "~community/crm/activities/components/molecules/ActivityRow/ActivityRow";
import { ActivityRow as ActivityRowData } from "~community/crm/activities/types/activityTypes";
import { getActivityRowKey } from "~community/crm/activities/utils/activityFeedUtil";

export interface ActivityBucketSectionProps {
  id: string;
  title: string;
  rows: ActivityRowData[];
  timeZone?: string;
  onRowClick: (row: ActivityRowData) => void;
  onToggleComplete: (row: ActivityRowData, isCompleted: boolean) => void;
}

const ActivityBucketSection: FC<ActivityBucketSectionProps> = ({
  id,
  title,
  rows,
  timeZone,
  onRowClick,
  onToggleComplete
}) => (
  <section id={id} aria-labelledby={`${id}-heading`} className="flex flex-col">
    <h2
      id={`${id}-heading`}
      className="subtitle1 mb-2 sticky top-0 bg-white z-10"
    >
      {title}
    </h2>
    <ul className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
      {rows.map((row) => (
        <li key={getActivityRowKey(row)}>
          <ActivityRow
            row={row}
            timeZone={timeZone}
            onRowClick={onRowClick}
            onToggleComplete={onToggleComplete}
          />
        </li>
      ))}
    </ul>
  </section>
);

export default ActivityBucketSection;
