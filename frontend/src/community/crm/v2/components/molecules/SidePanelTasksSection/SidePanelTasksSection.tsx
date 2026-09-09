import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import TaskGroup from "~community/crm/v2/components/molecules/TaskGroup/TaskGroup";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface Props {
  tasks: CrmTaskEntity[];
  emptyTitle: string;
  emptyDescription: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
}

const SidePanelTasksSection: FC<Props> = ({
  tasks,
  emptyTitle,
  emptyDescription,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onToggleComplete
}) => {
  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: onFetchNextPage
  });

  if (tasks.length === 0) {
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
      <TaskGroup
        tasks={tasks}
        isShowContact={false}
        onToggleComplete={onToggleComplete}
      />
      <div ref={loadingRef} />
    </div>
  );
};

export default SidePanelTasksSection;
