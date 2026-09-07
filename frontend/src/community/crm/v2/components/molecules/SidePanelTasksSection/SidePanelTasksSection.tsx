import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import TaskGroup from "~community/crm/v2/components/atoms/TaskGroup/TaskGroup";

interface Props {
  taskIds: number[];
  emptyTitle: string;
  emptyDescription: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

const SidePanelTasksSection: FC<Props> = ({
  taskIds,
  emptyTitle,
  emptyDescription,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage
}) => {
  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: onFetchNextPage
  });

  if (taskIds.length === 0) {
    return (
      <EmptyDataView
        icon={<SearchIcon width="24" height="24" />}
        title={emptyTitle}
        description={emptyDescription}
        className={{
          wrapper: "h-[14.25rem] bg-secondary-background rounded-lg"
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TaskGroup taskIds={taskIds} isShowContact={false} />
      <div ref={loadingRef} />
    </div>
  );
};

export default SidePanelTasksSection;
