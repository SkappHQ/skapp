import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetTaskById,
  useUpdateTaskCompletion
} from "~community/crm/api/TaskApi";
import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelTaskInfo from "~community/crm/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { getTaskTypeIcon } from "~community/crm/utils/taskUtil";

import TaskSidePanelSkeleton from "./TaskSidePanelSkeleton";

const TaskSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const { setIsTaskModalOpen, setTaskModalType, selectedTaskId } = useCrmStore(
    (store) => ({
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType,
      selectedTaskId: store.selectedTaskId
    })
  );

  const openTaskModal = (type: CrmModalTypes) => {
    setTaskModalType(type);
    setIsTaskModalOpen(true);
  };

  const { data: task, isLoading } = useGetTaskById(selectedTaskId!);
  const { mutate: updateTaskCompletion } = useUpdateTaskCompletion(() => {});

  const taskIcon = task ? getTaskTypeIcon(task.typeName, 24) : null;

  const menuItems = [
    {
      id: "edit",
      label: translateText(["editTask"]),
      icon: { start: <EditIcon width="16px" height="16px" /> },
      onClick: () => openTaskModal(CrmModalTypes.EDIT_TASK_MODAL)
    },
    {
      id: "delete",
      label: translateText(["deleteTask"]),
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
      { id: task?.id, isCompleted: true },
      { onSuccess: onClose }
    );
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick
      header={
        isLoading ? (
          <div className="flex items-center gap-4 pl-2" aria-hidden="true">
            <SkeletonShape circle className="h-6 w-6 shrink-0" />
            <SkeletonShape className="h-4 w-40" />
          </div>
        ) : (
          <div className="flex items-center gap-4 pl-2">
            {taskIcon}
            <span className="h1 text-black">{task?.name}</span>
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
              "aria-label": translateText(["kebabMenuAriaLabel"])
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
                <p className="subtitle1">{translateText(["notes"])}</p>
                <p className="subtitle3">
                  {task?.notes ?? translateText(["noNotes"])}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="h2">{translateText(["dealsTitle"])}</h2>
                <hr className="border-secondary-accent" />
                <SidePanelDealSection deals={task?.deal ? [task.deal] : []} />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="h2">{translateText(["relatedTasksTitle"])}</h2>
                <hr className="border-secondary-accent" />
                {/* <SidePanelTasksSection tasks={relatedTasks} /> */}
              </div>
            </div>

            <div className="w-[18.438rem] shrink-0">
              {task && (
                <SidePanelTaskInfo
                  task={task}
                  onMarkAsDone={handleMarkAsDone}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  );
};

export default TaskSidePanel;
