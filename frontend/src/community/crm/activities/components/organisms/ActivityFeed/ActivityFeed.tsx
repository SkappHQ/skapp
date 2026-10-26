import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityBucketSection from "~community/crm/activities/components/molecules/ActivityBucketSection/ActivityBucketSection";
import ActivityFeedSkeleton from "~community/crm/activities/components/molecules/ActivityFeedSkeleton/ActivityFeedSkeleton";
import {
  ACTIVITY_BUCKET_LABEL_KEYS,
  ACTIVITY_FEED_ID,
  ACTIVITY_TABS
} from "~community/crm/activities/constants/activityConstants";
import {
  ActivityBucket,
  ActivityBucketGroup,
  ActivityFeedResponse,
  ActivityRow,
  ActivityTab
} from "~community/crm/activities/types/activityTypes";
import {
  formatMonthHeading,
  getVisibleBuckets
} from "~community/crm/activities/utils/activityFeedUtil";

export interface ActivityFeedProps {
  id?: string;
  activeTab: ActivityTab;
  rows: ActivityFeedResponse;
  searchTerm: string;
  isLoading: boolean;
  isError: boolean;
  timeZone?: string;
  onRowClick: (row: ActivityRow) => void;
  onToggleComplete: (row: ActivityRow, isCompleted: boolean) => void;
}

const EMPTY_STATE_CLASSES = {
  wrapper: "bg-secondary-background rounded-lg"
};

const ActivityFeed: FC<ActivityFeedProps> = ({
  id = ACTIVITY_FEED_ID,
  activeTab,
  rows,
  searchTerm,
  isLoading,
  isError,
  timeZone,
  onRowClick,
  onToggleComplete
}) => {
  const translateText = useTranslator("crmModule");

  const buckets = useMemo(
    () => getVisibleBuckets(rows, timeZone),
    [rows, timeZone]
  );

  const getBucketTitle = (group: ActivityBucketGroup): string =>
    group.bucket === ActivityBucket.BY_MONTH && group.monthKey
      ? formatMonthHeading(group.monthKey)
      : translateText([
          "activities",
          "buckets",
          ACTIVITY_BUCKET_LABEL_KEYS[group.bucket]
        ]);

  const trimmedSearchTerm = searchTerm.trim();
  const emptyStateKey =
    ACTIVITY_TABS.find((tab) => tab.id === activeTab)?.labelKey ??
    ACTIVITY_TABS[0].labelKey;

  const showCheckbox = activeTab === ActivityTab.TASKS;

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityFeedSkeleton
          id={`${id}-loading`}
          message={translateText(["activities", "feed", "loading"])}
          showCheckbox={showCheckbox}
        />
      );
    }

    if (isError) {
      return (
        <div
          id={`${id}-error`}
          role="alert"
          className="flex items-center justify-center p-6 rounded-lg bg-secondary-background body2 text-center"
        >
          {translateText(["activities", "feed", "loadError"])}
        </div>
      );
    }

    if (buckets.length === 0) {
      return trimmedSearchTerm ? (
        <EmptyDataView
          icon={<SearchIcon />}
          title={translateText(["activities", "feed", "noResults", "title"], {
            term: trimmedSearchTerm
          })}
          description={translateText([
            "activities",
            "feed",
            "noResults",
            "description"
          ])}
          className={EMPTY_STATE_CLASSES}
        />
      ) : (
        <EmptyDataView
          icon={<SearchIcon />}
          title={translateText([
            "activities",
            "feed",
            "emptyState",
            emptyStateKey,
            "title"
          ])}
          description={translateText([
            "activities",
            "feed",
            "emptyState",
            emptyStateKey,
            "description"
          ])}
          className={EMPTY_STATE_CLASSES}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {buckets.map((group) => (
          <ActivityBucketSection
            key={group.id}
            id={`${id}-bucket-${group.id}`}
            title={getBucketTitle(group)}
            rows={group.rows}
            timeZone={timeZone}
            showCheckbox={showCheckbox}
            onRowClick={onRowClick}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    );
  };

  return (
    <div id={id} className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-4">
      {renderContent()}
    </div>
  );
};

export default ActivityFeed;
