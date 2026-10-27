import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityBucketSection from "~community/crm/activities/components/molecules/ActivityBucketSection/ActivityBucketSection";
import ActivityFeedSkeleton from "~community/crm/activities/components/molecules/ActivityFeedSkeleton/ActivityFeedSkeleton";
import { ACTIVITY_SECTION_LABEL_KEYS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedResponse,
  ActivityRow,
  ActivitySection,
  ActivitySectionGroup,
  ActivityTab
} from "~community/crm/activities/types/activityTypes";
import {
  formatMonthHeading,
  getActivitySections
} from "~community/crm/activities/utils/activityFeedUtil";

const ACTIVITY_FEED_ID = "crm-activity-feed";

export interface ActivityFeedProps {
  id?: string;
  activeTab: ActivityTab;
  pages: ActivityFeedResponse[];
  searchTerm: string;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  timeZone?: string;
  onLoadMore: () => void;
  onRowClick: (row: ActivityRow) => void;
  onToggleComplete: (row: ActivityRow, isCompleted: boolean) => void;
}

const EMPTY_STATE_CLASSES = {
  wrapper: "bg-secondary-background rounded-lg"
};

const ActivityFeed: FC<ActivityFeedProps> = ({
  id = ACTIVITY_FEED_ID,
  activeTab,
  pages,
  searchTerm,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  timeZone,
  onLoadMore,
  onRowClick,
  onToggleComplete
}) => {
  const translateText = useTranslator("crmModule");

  const sections = useMemo(
    () =>
      getActivitySections(
        pages.flatMap((page) => page.items),
        timeZone
      ),
    [pages, timeZone]
  );

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore
  });

  const getSectionTitle = (group: ActivitySectionGroup): string =>
    group.section === ActivitySection.BY_MONTH && group.monthKey
      ? formatMonthHeading(group.monthKey)
      : translateText([
          "activities",
          "buckets",
          ACTIVITY_SECTION_LABEL_KEYS[group.section]
        ]);

  const trimmedSearchTerm = searchTerm.trim();
  const emptyStateKey = activeTab.toLowerCase();

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

    if (sections.length === 0) {
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
        {sections.map((group) => (
          <ActivityBucketSection
            key={group.id}
            id={`${id}-bucket-${group.id}`}
            title={getSectionTitle(group)}
            rows={group.rows}
            timeZone={timeZone}
            showCheckbox={showCheckbox}
            onRowClick={onRowClick}
            onToggleComplete={onToggleComplete}
          />
        ))}

        {isFetchingNextPage && (
          <ActivityFeedSkeleton
            id={`${id}-loading-more`}
            message={translateText(["activities", "feed", "loadingMore"])}
            groupCount={1}
            rowCount={2}
            showCheckbox={showCheckbox}
          />
        )}
      </div>
    );
  };

  return (
    <div id={id} className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-4">
      {renderContent()}
      <div id={`${id}-load-more-trigger`} ref={loadingRef} aria-hidden="true" />
    </div>
  );
};

export default ActivityFeed;
