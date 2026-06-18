import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelRelatedTasksSection from "~community/crm/components/molecules/SidePanelRelatedTasksSection/SidePanelRelatedTasksSection";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelTaskInfo from "~community/crm/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import SidePanelTaskNotes from "~community/crm/components/molecules/SidePanelTaskNotes/SidePanelTaskNotes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { getTaskTypeIcon } from "~community/crm/utils/taskHelpers";

const TaskDetailSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const {
    selectedTask,
    setSelectedTask,
    setIsCrmSidePanelOpen,
    setIsTaskModalOpen,
    setTaskModalType
  } = useCrmStore((store) => ({
    selectedTask: store.selectedTask,
    setSelectedTask: store.setSelectedTask,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    setTaskModalType: store.setTaskModalType
  }));

  const handleClose = (): void => {
    setSelectedTask(null);
    setIsCrmSidePanelOpen(false);
    if (onClose) onClose();
  };

  const openTaskModal = (type: CrmModalTypes) => {
    setTaskModalType(type);
    setIsTaskModalOpen(true);
  };

  if (!selectedTask) return null;

  const taskIcon = getTaskTypeIcon(selectedTask.type?.name ?? "Other");
  const taskDeals = selectedTask.deal ? [selectedTask.deal] : [];

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

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      width="lg"
      animation="slide"
      closeOnBackdropClick
      header={
        <div className="flex items-center gap-4 pl-2">
          {taskIcon}
          <span className="h1 text-black">{selectedTask.name}</span>
        </div>
      }
      headerActions={
        <KebabMenu
          id="task-actions"
          menuItems={menuItems}
          anchorButton={{
            "aria-label": translateText(["kebabMenuAriaLabel"])
          }}
          className={{
            anchorElement:
              "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
          }}
        />
      }
    >
      <div className="flex gap-6 pb-4">
        <div className="flex flex-col flex-1 gap-6 min-w-0">
          <SidePanelTaskNotes notes={selectedTask.notes} />

          <SidePanelDealSection deals={taskDeals} />

          <SidePanelRelatedTasksSection
            tasks={[]}
            currentTaskId={selectedTask.id}
          />
        </div>

        <div className="w-[240px] shrink-0">
          <SidePanelTaskInfo task={selectedTask} />
        </div>
      </div>
    </SidePanel>
  );
};

export default TaskDetailSidePanel;
