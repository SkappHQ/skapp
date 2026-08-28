import { EmptyDataView, PlusIcon, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import SidePanelTasksList from "./SidePanelTasksList";

interface SidePanelTasksSectionProps {
  taskIds?: number[];
  emptyDescription?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
}

const SidePanelTasksSection: FC<SidePanelTasksSectionProps> = ({
  taskIds,
  emptyDescription,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage
}) => {
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsTaskModalOpen, setTaskModalType } = useCrmStoreV2(
    useShallow((store) => ({
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType
    }))
  );

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: () => onFetchNextPage?.()
  });

  const handleAddTask = () => {
    guardCrmCreate(CrmLimitResource.TASKS, () => {
      setTaskModalType(CrmModalTypes.ADD_TASK_MODAL);
      setIsTaskModalOpen(true);
    });
  };

  if (taskIds !== undefined && taskIds.length > 0) {
    return (
      <div>
        <SidePanelTasksList
          taskIds={taskIds}
          onAddTask={handleAddTask}
          isAddTaskDisabled={isCheckingCrmLimit}
        />
        <div ref={loadingRef} />
      </div>
    );
  }

  return (
    <EmptyDataView
      icon={<SearchIcon width="24" height="24" />}
      title={translateText(["tasks", "emptyTitle"])}
      description={
        emptyDescription ?? translateText(["tasks", "emptyDescription"])
      }
      button={{
        children: translateText(["tasks", "addTaskButtonEmptyView"]),
        variant: "tertiary",
        onClick: handleAddTask,
        disabled: isCheckingCrmLimit,
        isLoading: isCheckingCrmLimit,
        icon: <PlusIcon />,
        "aria-label": translateText(["tasks", "addTaskButtonEmptyView"])
      }}
      className={{
        wrapper: "h-[14.25rem] bg-secondary-background rounded-lg"
      }}
    />
  );
};

export default SidePanelTasksSection;
