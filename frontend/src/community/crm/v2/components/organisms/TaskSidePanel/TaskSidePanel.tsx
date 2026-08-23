import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import {
  getTaskTypeIcon,
  getTaskTypeName
} from "~community/crm/v2/utils/crmTaskUtils";

import TaskSidePanelContent from "./TaskSidePanelContent";

const TaskSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedTaskId,
    setSelectedTaskId,
    closeCrmSidePanel,
    setIsTaskModalOpen,
    setTaskModalType,
    taskTypes,
    tasks
  } = useCrmStoreV2((state) => ({
    isCrmSidePanelOpen: state.isCrmSidePanelOpen,
    crmSidePanelType: state.crmSidePanelType,
    selectedTaskId: state.selectedTaskId,
    setSelectedTaskId: state.setSelectedTaskId,
    closeCrmSidePanel: state.closeCrmSidePanel,
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    setTaskModalType: state.setTaskModalType,
    taskTypes: state.taskTypes,
    tasks: state.tasks
  }));

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.TASK_SIDE_PANEL;

  const selectedTask = selectedTaskId ? tasks[selectedTaskId] : undefined;

  const handleClose = () => {
    setSelectedTaskId(null);
    closeCrmSidePanel();
  };

  const openTaskModal = (type: CrmModalTypes) => {
    setTaskModalType(type);
    setIsTaskModalOpen(true);
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

  if (selectedTaskId === null) {
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
      <TaskSidePanelContent taskId={selectedTaskId} onClose={handleClose} />
    </SidePanel>
  );
};

export default TaskSidePanel;
