import { EmptyDataView, PlusIcon, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC, startTransition, useOptimistic } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/v2/api/TaskApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";
import { resolveTasks, updateTask } from "~community/crm/v2/utils/taskUtil";
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

  const { setToastMessage } = useToast();

  const { tasks, setTasks, setIsTaskModalOpen, setTaskModalType } =
    useCrmStoreV2(
      useShallow((store) => ({
        tasks: store.tasks,
        setTasks: store.setTasks,
        setIsTaskModalOpen: store.setIsTaskModalOpen,
        setTaskModalType: store.setTaskModalType
      }))
    );

  const translateTaskText = useTranslator("crmModule", "tasks");

  const [optimisticTasks, applyOptimisticCompletion] = useOptimistic(
    tasks,
    (
      current,
      { taskId, isCompleted }: { taskId: number; isCompleted: boolean }
    ) => updateTask(current, taskId, { isCompleted })
  );

  const { mutateAsync: updateCompletion } = useUpdateTask((updatedTask) => {
    if (updatedTask.id !== undefined) {
      setTasks(updateTask(tasks, updatedTask.id, updatedTask));
    }
  });

  const handleToggleComplete = (taskId: number, isCompleted: boolean) => {
    startTransition(async () => {
      applyOptimisticCompletion({ taskId, isCompleted });

      try {
        await updateCompletion({ id: taskId, task: { isCompleted } });
      } catch {
        // The optimistic row reverts on its own once this transition ends,
        // because the store was never written to.
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateTaskText(["toggleErrorTitle"]),
          description: translateTaskText(["toggleErrorDescription"])
        });
      }
    });
  };

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
          tasks={resolveTasks(taskIds, optimisticTasks)}
          onAddTask={handleAddTask}
          isAddTaskDisabled={isCheckingCrmLimit}
          onToggleComplete={handleToggleComplete}
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
