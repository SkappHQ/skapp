import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  TASK_DETAIL_ICON_SIZE,
  TASK_PAGE_SIZE
} from "~community/crm/constants/taskConstants";
import {
  useGetRelatedTasks,
  useUpdateTask
} from "~community/crm/v2/api/TaskApi";
import SidePanelTaskDeal from "~community/crm/v2/components/molecules/SidePanelTaskDeal/SidePanelTaskDeal";
import SidePanelTaskInfo from "~community/crm/v2/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import {
  mergeEntityRecord,
  toTasksRecord
} from "~community/crm/v2/utils/crmEntityUtils";
import {
  getTaskTypeIcon,
  getTaskTypeName
} from "~community/crm/v2/utils/crmTaskUtils";

const TaskSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedTaskId,
    setSelectedTaskId,
    closeCrmSidePanel,
    setIsTaskModalOpen,
    setTaskModalType,
    taskTypes
  } = useCrmStoreV2((state) => ({
    isCrmSidePanelOpen: state.isCrmSidePanelOpen,
    crmSidePanelType: state.crmSidePanelType,
    selectedTaskId: state.selectedTaskId,
    setSelectedTaskId: state.setSelectedTaskId,
    closeCrmSidePanel: state.closeCrmSidePanel,
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    setTaskModalType: state.setTaskModalType,
    taskTypes: state.taskTypes
  }));
  /**
   * The list view already carries every field this panel needs (the v2 task
   * response is ids-only either way), so this reads the store record straight
   * instead of re-fetching by id the way the v1 panel does.
   */
  const selectedTask = useCrmStoreV2((state) =>
    selectedTaskId === null ? undefined : state.tasks[selectedTaskId]
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

  const { mutate: updateTaskCompletion } = useUpdateTask();

  const {
    data: relatedTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetRelatedTasks(
    selectedTaskId ?? 0,
    TASK_PAGE_SIZE,
    selectedTaskId !== null
  );

  const relatedTaskIds = (
    relatedTasksData?.pages.flatMap((page) => page.items) ?? []
  )
    .filter((task) => task.id !== selectedTaskId)
    .map((task) => task.id)
    .filter((id): id is number => id !== undefined);

  const taskIcon = selectedTask
    ? getTaskTypeIcon(
        getTaskTypeName(selectedTask.typeId, taskTypes),
        TASK_DETAIL_ICON_SIZE
      )
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
    if (selectedTaskId === null) return;

    updateTaskCompletion(
      { id: selectedTaskId, isCompleted: true },
      {
        onSuccess: (updatedTask) => {
          const { tasks, setTasks } = useCrmStoreV2.getState();
          setTasks(mergeEntityRecord(tasks, toTasksRecord([updatedTask])));
          handleClose();
        },
        onError: () =>
          setToastMessage({
            open: true,
            toastType: ToastType.ERROR,
            title: translateText(["toggleErrorTitle"]),
            description: translateText(["toggleErrorDescription"])
          })
      }
    );
  };

  if (!selectedTask) {
    return (
      <SidePanel isOpen={isOpen} onClose={handleClose} closeOnBackdropClick />
    );
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBackdropClick
      header={
        <div className="flex items-center gap-4 pl-2">
          {taskIcon}
          <span className="h1 text-black">{selectedTask.name}</span>
        </div>
      }
      headerActions={
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
      }
    >
      <div className="flex flex-col pb-4 gap-[16px]">
        <div className="flex gap-6 pb-4">
          <div className="flex flex-col flex-1 gap-6 min-w-0">
            <div className="flex flex-col gap-1">
              <p className="subtitle1">
                {translateText(["sidePanel", "notes"])}
              </p>
              <p className="subtitle3">
                {selectedTask.notes ?? translateText(["sidePanel", "noNotes"])}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="h2">
                {translateText(["sidePanel", "dealsTitle"])}
              </h2>
              <hr className="border-secondary-accent" />
              <SidePanelTaskDeal dealId={selectedTask.dealId} />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="h2">
                {translateText(["sidePanel", "relatedTasksTitle"])}
              </h2>
              <hr className="border-secondary-accent" />
              <SidePanelTasksSection
                taskIds={relatedTaskIds}
                isShowContact={true}
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
              task={selectedTask}
              onMarkAsDone={handleMarkAsDone}
            />
          </div>
        </div>
      </div>
    </SidePanel>
  );
};

export default TaskSidePanel;
