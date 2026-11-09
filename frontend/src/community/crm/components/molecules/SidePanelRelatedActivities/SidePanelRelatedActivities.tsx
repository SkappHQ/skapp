import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import ActivityRow from "~community/crm/activities/components/molecules/ActivityRow/ActivityRow";
import { ActivityRow as ActivityRowData } from "~community/crm/activities/types/activityTypes";
import { getActivityRowKey } from "~community/crm/activities/utils/activityFeedUtil";

interface Props {
  title: string;
  rows: ActivityRowData[];
  emptyTitle: string;
  emptyDescription: string;
  onRowClick: (row: ActivityRowData) => void;
}

const SidePanelRelatedActivities: FC<Props> = ({
  title,
  rows,
  emptyTitle,
  emptyDescription,
  onRowClick
}) => {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="h2">{title}</h2>
      <hr className="border-secondary-accent" />
      {rows.length ? (
        <ul className="flex flex-col divide-y divide-secondary-accent">
          {rows.map((row) => (
            <li key={getActivityRowKey(row)}>
              <ActivityRow
                row={row}
                isShowCheckbox={false}
                taskCompletions={{}}
                onRowClick={onRowClick}
                onToggleComplete={() => {}}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyDataView
          icon={<SearchIcon width="24" height="24" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </div>
  );
};

export default SidePanelRelatedActivities;
