import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetRelatedTasks,
  useGetTaskById,
  useUpdateTask
} from "~community/crm/api/TaskApi";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import SidePanelTaskInfo from "~community/crm/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import {
  TASK_DETAIL_ICON_SIZE,
  TASK_PAGE_SIZE
} from "~community/crm/constants/taskConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { getTaskTypeIcon } from "~community/crm/utils/taskUtil";

import TaskSidePanelSkeleton from "./TaskSidePanelSkeleton";

const TaskSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedTaskId,
    closeCrmSidePanel,
    setIsTaskModalOpen,
    setTaskModalType,
    selectedTaskId,
    getTaskById,
    updateTask
  } = useCrmStore(
    useShallow((store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      setSelectedTaskId: store.setSelectedTaskId,
      closeCrmSidePanel: store.closeCrmSidePanel,
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType,
      selectedTaskId: store.selectedTaskId,
      getTaskById: store.getTaskById,
      updateTask: store.updateTask
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.TASK_SIDE_PANEL;

  const handleClose = () => {
    setSelectedTaskId(null);
    closeCrmSidePanel();
  };

  const openTaskModal = (type: CrmModalTypes) => {
    setTaskModalType(type);
    setIsTaskModalOpen(true);
  };

  const handleUpdateTaskCompletionError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toggleErrorTitle"]),
      description: translateText(["toggleErrorDescription"])
    });
  };

  const { data: taskDetail, isLoading } = useGetTaskById(selectedTaskId!);
  const { mutate: updateTaskCompletion } = useUpdateTask();

  useEffect(() => {
    if (taskDetail) {
      updateTask(taskDetail);
    }
  }, [taskDetail]);

  const selectedTask = getTaskById(selectedTaskId!);

  const dealId = selectedTask?.deal?.id;
  const contactId = selectedTask?.contactId;

  const isEnabled = dealId != null || contactId != null;

  const {
    data: relatedTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetRelatedTasks(
    { dealId, contactId, size: TASK_PAGE_SIZE },
    isEnabled
  );

  const relatedTasks = (
    relatedTasksData?.pages.flatMap((page) => page.items) ?? []
  ).filter((task) => task.id !== selectedTaskId);

  const taskIcon = selectedTask
    ? getTaskTypeIcon(selectedTask.typeName, TASK_DETAIL_ICON_SIZE)
    : null;

  const menuItems = [
    {
      id: "edit",
      label: translateText(["sidePanel", "editTask"]),
      icon: { start: <EditIcon width="16px" height="16px" /> },
      onClick: () => openTaskModal(CrmModalTypes.EDIT_TASK_MODAL)
    },
    {
      id: "delete",
      label: translateText(["sidePanel", "deleteTask"]),
      icon: {
        start: (
          <DeleteButtonIcon
            width="12px"
            height="14px"
            fill="var(--color-semantic-red-text)"
          />
        )
      },
      activeBehavior: "hover:bg-semantic-red-background text-semantic-red-text",
      onClick: () => openTaskModal(CrmModalTypes.DELETE_TASK_MODAL)
    }
  ];

  const handleMarkAsDone = () => {
    updateTaskCompletion(
      { id: selectedTaskId!, isCompleted: true },
      { onSuccess: handleClose, onError: handleUpdateTaskCompletionError }
    );
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBackdropClick
      header={
        isLoading ? (
          <SidePanelHeaderSkeleton isShowLastUpdate={false} />
        ) : (
          <div className="flex items-center gap-4 pl-2">
            {taskIcon}
            <span className="h1 text-black">{selectedTask?.name}</span>
          </div>
        )
      }
      headerActions={
        isLoading ? (
          <SidePanelHeaderActionsSkeleton />
        ) : (
          <KebabMenu
            id={"task-actions"}
            menuItems={menuItems}
            anchorButton={{
              "aria-label": translateText(["sidePanel", "kebabMenuAriaLabel"])
            }}
            className={{
              anchorElement:
                "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
            }}
          />
        )
      }
    >
      {isLoading ? (
        <TaskSidePanelSkeleton />
      ) : (
        <div className="flex flex-col pb-4 gap-[16px]">
          <div className="flex gap-6 pb-4">
            <div className="flex flex-col flex-1 gap-6 min-w-0">
              <div className="flex flex-col gap-1">
                <p className="subtitle1">
                  {translateText(["sidePanel", "notes"])}
                </p>
                <p className="subtitle3">
                  {selectedTask?.notes ??
                    translateText(["sidePanel", "noNotes"])}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="h2">
                  {translateText(["sidePanel", "dealsTitle"])}
                </h2>
                <hr className="border-secondary-accent" />
                <SidePanelDealSection
                  deals={selectedTask?.deal ? [selectedTask.deal] : []}
                  showAddDealAction={false}
                  emptyDescription={translateText([
                    "sidePanel",
                    "noDealsDescription"
                  ])}
                />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="h2">
                  {translateText(["sidePanel", "relatedTasksTitle"])}
                </h2>
                <hr className="border-secondary-accent" />
                <SidePanelTasksSection
                  tasks={relatedTasks}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  onFetchNextPage={fetchNextPage}
                  showAddTaskAction={false}
                  emptyDescription={translateText([
                    "sidePanel",
                    "noRelatedTasksDescription"
                  ])}
                />
              </div>
            </div>

            <div className="w-[18.438rem] shrink-0">
              <SidePanelTaskInfo
                task={selectedTask!}
                onMarkAsDone={handleMarkAsDone}
              />
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  );
};

export default TaskSidePanel;
