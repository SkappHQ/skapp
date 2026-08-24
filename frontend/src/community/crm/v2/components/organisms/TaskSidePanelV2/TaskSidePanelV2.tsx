import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import TaskSidePanelSkeleton from "~community/crm/components/organisms/TaskSidePanel/TaskSidePanelSkeleton";
import { useGetDealsByIds } from "~community/crm/v2/api/DealApi";
import {
  useGetRelatedTasks,
  useGetTaskById,
  useUpdateTask
} from "~community/crm/v2/api/TaskApi";
import SidePanelTaskDeal from "~community/crm/v2/components/molecules/SidePanelTaskDeal/SidePanelTaskDeal";
import SidePanelTaskInfo from "~community/crm/v2/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import {
  TASK_DETAIL_ICON_SIZE,
  TASK_PAGE_SIZE
} from "~community/crm/v2/constants/taskConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import {
  getMissingDealIds,
  mergeDeals,
  resolveDealRelations
} from "~community/crm/v2/utils/dealUtil";
import {
  getTaskTypeIcon,
  getTaskTypeName,
  mergeTasks,
  resolveTaskRelations,
  toTaskIds
} from "~community/crm/v2/utils/taskUtil";

const TaskSidePanelV2: FC = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedTaskId,
    selectedTask,
    setSelectedTaskId,
    closeCrmSidePanel,
    setIsTaskModalOpen,
    setTaskModalType,
    taskTypes,
    deals,
    tasks,
    owners,
    contacts,
    stages,
    setTasks,
    setDeals
  } = useCrmStoreV2(
    useShallow((store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      selectedTaskId: store.selectedTaskId,
      selectedTask:
        store.selectedTaskId != null
          ? store.tasks[store.selectedTaskId]
          : undefined,
      setSelectedTaskId: store.setSelectedTaskId,
      closeCrmSidePanel: store.closeCrmSidePanel,
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType,
      setTasks: store.setTasks,
      taskTypes: store.taskTypes,
      deals: store.deals,
      tasks: store.tasks,
      owners: store.owners,
      contacts: store.contacts,
      stages: store.stages,
      setDeals: store.setDeals
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

  const { data: taskData } = useGetTaskById(
    selectedTaskId ?? 0,
    selectedTaskId != null
  );

  const dealIds = useMemo(
    () => (selectedTask?.dealId != null ? [selectedTask.dealId] : []),
    [selectedTask?.dealId]
  );

  const { owner, contact } = useMemo(
    () => resolveTaskRelations(selectedTask, owners, contacts),
    [selectedTask, owners, contacts]
  );

  const selectedDeal =
    selectedTask?.dealId != null ? deals[selectedTask.dealId] : undefined;

  const { owner: dealOwner, stage: dealStage } = useMemo(
    () => resolveDealRelations(selectedDeal, owners, stages),
    [selectedDeal, owners, stages]
  );

  const missingDealIds = useMemo(
    () => getMissingDealIds(dealIds, deals),
    [dealIds, deals]
  );

  const { data: fetchedDeals } = useGetDealsByIds(
    missingDealIds,
    missingDealIds.length > 0
  );

  useEffect(() => {
    if (fetchedDeals && fetchedDeals.length > 0) {
      setDeals(mergeDeals(deals, fetchedDeals));
    }
  }, [fetchedDeals, setDeals]);

  const { mutate: updateTaskCompletion } = useUpdateTask();

  const {
    data: relatedTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetRelatedTasks(
    { id: selectedTaskId!, size: TASK_PAGE_SIZE },
    selectedTaskId != null
  );

  const relatedTasks = useMemo(
    () =>
      (relatedTasksData?.pages.flatMap((page) => page.items) ?? []).filter(
        (relatedTask) => relatedTask.id !== selectedTaskId
      ),
    [relatedTasksData, selectedTaskId]
  );

  const relatedTaskIds = useMemo(() => toTaskIds(relatedTasks), [relatedTasks]);

  useEffect(() => {
    if (selectedTaskId == null) return;
    setTasks(
      mergeTasks(tasks, [
        ...(taskData ? [taskData] : []),
        ...relatedTasks,
        { id: selectedTaskId, relatedTaskIds }
      ])
    );
  }, [taskData, relatedTasks, relatedTaskIds, selectedTaskId, setTasks]);

  const handleMarkAsDone = () => {
    if (selectedTaskId == null) return;
    updateTaskCompletion(
      { id: selectedTaskId, isCompleted: true },
      {
        onSuccess: (updatedTask) => {
          setTasks(mergeTasks(tasks, [updatedTask]));
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

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBackdropClick
      header={
        selectedTask && (
          <div className="flex items-center gap-4 pl-2">
            {getTaskTypeIcon(
              getTaskTypeName(selectedTask.typeId, taskTypes),
              TASK_DETAIL_ICON_SIZE
            )}
            <span className="h1 text-black">{selectedTask.name}</span>
          </div>
        )
      }
      headerActions={
        selectedTask && (
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
      {!selectedTask ? (
        <TaskSidePanelSkeleton />
      ) : (
        <div className="flex flex-col pb-4 gap-4">
          <div className="flex gap-6 pb-4">
            <div className="flex flex-col flex-1 gap-6 min-w-0">
              <div className="flex flex-col gap-1">
                <p className="subtitle1">
                  {translateText(["sidePanel", "notes"])}
                </p>
                <p className="subtitle3">
                  {selectedTask.notes ??
                    translateText(["sidePanel", "noNotes"])}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="h2">
                  {translateText(["sidePanel", "dealsTitle"])}
                </h2>
                <hr className="border-secondary-accent" />
                <SidePanelTaskDeal
                  deal={selectedDeal}
                  owner={dealOwner}
                  stage={dealStage}
                />
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
                owner={owner}
                contact={contact}
                onMarkAsDone={handleMarkAsDone}
              />
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  );
};

export default TaskSidePanelV2;
