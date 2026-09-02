import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  MenuItemProps,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetRelatedTasks,
  useGetTaskById,
  useUpdateTask
} from "~community/crm/v2/api/TaskApi";
import TaskTypeIcon from "~community/crm/v2/components/atoms/TaskTypeIcon/TaskTypeIcon";
import SidePanelDealSection from "~community/crm/v2/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelHeaderActionsSkeleton from "~community/crm/v2/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/v2/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import SidePanelTaskInfo from "~community/crm/v2/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { TASK_PAGE_SIZE } from "~community/crm/v2/constants/taskConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmModalTypes,
  CrmRelatedTasksFilter,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import { toTaskIds, updateTaskRecord } from "~community/crm/v2/utils/taskUtil";

const TASK_DETAIL_ICON_SIZE = 24;

interface Props {
  taskId: number;
}

const TaskSidePanelV2: FC<Props> = ({ taskId }) => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    tasks,
    taskTypes,
    setTasks,
    setSelectedTaskId,
    closeCrmSidePanel,
    setIsTaskModalOpen,
    setTaskModalType
  } = useCrmStoreV2(
    useShallow((store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      tasks: store.tasks,
      taskTypes: store.taskTypes,
      setTasks: store.setTasks,
      setSelectedTaskId: store.setSelectedTaskId,
      closeCrmSidePanel: store.closeCrmSidePanel,
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.TASK_SIDE_PANEL;

  const task = tasks[taskId];
  const typeName = task?.typeId != null ? taskTypes[task.typeId]?.name : undefined;

  const { data: taskDetail, isLoading } = useGetTaskById(taskId, isOpen);

  const relatedTasksFilter: CrmRelatedTasksFilter = useMemo(
    () => ({ size: TASK_PAGE_SIZE }),
    []
  );

  const {
    data: relatedTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetRelatedTasks(taskId, relatedTasksFilter, isOpen);

  const relatedTasks = useMemo(
    () => relatedTasksData?.pages.flatMap((page) => page.items) ?? [],
    [relatedTasksData]
  );

  useEffect(() => {
    if (!taskDetail && !relatedTasksData) return;

    const currentTask: CrmTaskEntity = { ...taskDetail, id: taskId };

    if (relatedTasksData) {
      currentTask.relatedTaskIds = toTaskIds(relatedTasks);
    }

    setTasks(updateTaskRecord(tasks, [currentTask, ...relatedTasks]));
  }, [taskDetail, relatedTasksData]);

  const handleClose = () => {
    setSelectedTaskId(null);
    closeCrmSidePanel();
  };

  const handleMarkAsDoneSuccess = (updatedTask: CrmTaskEntity) => {
    setTasks(updateTaskRecord(tasks, [updatedTask]));
    handleClose();
  };

  const handleMarkAsDoneError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toggleErrorTitle"]),
      description: translateText(["toggleErrorDescription"])
    });
  };

  const { mutate: markTaskAsDone } = useUpdateTask(
    handleMarkAsDoneSuccess,
    handleMarkAsDoneError
  );

  const handleMarkAsDone = () => {
    markTaskAsDone({ id: taskId, task: { isCompleted: true } });
  };

  const menuItems: MenuItemProps[] = [
    {
      id: "edit",
      label: translateText(["sidePanel", "editTask"]),
      icon: { start: <EditIcon width="16px" height="16px" /> },
      onClick: () => {
        setTaskModalType(CrmModalTypes.EDIT_TASK_MODAL);
        setIsTaskModalOpen(true);
      }
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
      onClick: () => {
        setTaskModalType(CrmModalTypes.DELETE_TASK_MODAL);
        setIsTaskModalOpen(true);
      }
    }
  ];

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
            <TaskTypeIcon typeName={typeName} size={TASK_DETAIL_ICON_SIZE} />
            <span className="h1 text-black">{task.name}</span>
          </div>
        )
      }
      headerActions={
        isLoading ? (
          <SidePanelHeaderActionsSkeleton />
        ) : (
          <KebabMenu
            id="task-actions"
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
      <div className="flex gap-6 pb-4">
        <div className="flex flex-col flex-1 gap-6 min-w-0">
          <div className="flex flex-col gap-1">
            <p className="subtitle1">{translateText(["sidePanel", "notes"])}</p>
            <p className="subtitle3">
              {task.notes ?? translateText(["sidePanel", "noNotes"])}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="h2">{translateText(["sidePanel", "dealsTitle"])}</h2>
            <hr className="border-secondary-accent" />
            <SidePanelDealSection
              dealId={task.dealId}
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
              taskIds={task.relatedTaskIds ?? []}
              emptyDescription={translateText([
                "sidePanel",
                "noRelatedTasksDescription"
              ])}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onFetchNextPage={fetchNextPage}
            />
          </div>
        </div>

        <div className="w-[18.438rem] shrink-0">
          <SidePanelTaskInfo taskId={taskId} onMarkAsDone={handleMarkAsDone} />
        </div>
      </div>
    </SidePanel>
  );
};

export default TaskSidePanelV2;
