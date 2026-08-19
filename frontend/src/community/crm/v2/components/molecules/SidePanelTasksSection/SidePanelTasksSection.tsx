import { EmptyDataView, PlusIcon, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import SidePanelTasksList from "./SidePanelTasksList";

interface Props {
  taskIds: number[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onTaskRowClick?: () => void;
  emptyDescription?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
  showAddTaskAction?: boolean;
}

const SidePanelTasksSection: FC<Props> = ({
  taskIds,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick,
  emptyDescription,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage = () => {},
  showAddTaskAction = true
}) => {
  const { guardCrmCreate } = useCrmLimitGuard();

  const { setIsTaskModalOpen, setTaskModalType } = useCrmStoreV2((state) => ({
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    setTaskModalType: state.setTaskModalType
  }));

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: onFetchNextPage
  });

  const handleAddTask = () => {
    guardCrmCreate(CrmLimitResource.TASKS, () => {
      setTaskModalType(CrmModalTypes.ADD_TASK_MODAL);
      setIsTaskModalOpen(true);
    });
  };

  return taskIds.length > 0 ? (
    <div ref={loadingRef}>
      <SidePanelTasksList
        taskIds={taskIds}
        isCheckTaskVisible={isCheckTaskVisible}
        isShowContact={isShowContact}
        onTaskRowClick={onTaskRowClick}
        onAddTask={handleAddTask}
        showAddTaskAction={showAddTaskAction}
      />
    </div>
  ) : (
    <EmptyDataView
      icon={<SearchIcon width="24" height="24" />}
      title={translateText(["tasks", "emptyTitle"])}
      description={
        emptyDescription ?? translateText(["tasks", "emptyDescription"])
      }
      button={
        showAddTaskAction
          ? {
              children: translateText(["tasks", "addTaskButtonEmptyView"]),
              variant: "tertiary",
              onClick: handleAddTask,
              icon: <PlusIcon />,
              "aria-label": translateText(["tasks", "addTaskButtonEmptyView"])
            }
          : undefined
      }
      className={{
        wrapper: "h-[14.25rem] bg-secondary-background rounded-lg"
      }}
    />
  );
};

export default SidePanelTasksSection;
