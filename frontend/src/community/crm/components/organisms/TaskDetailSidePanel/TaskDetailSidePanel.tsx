import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelTaskInfo from "~community/crm/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import SidePanelTaskNotes from "~community/crm/components/molecules/SidePanelTaskNotes/SidePanelTaskNotes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
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

  const handleMarkAsDone = () => {
    if (!selectedTask || selectedTask.isCompleted) return;

    setSelectedTask({
      ...selectedTask,
      isCompleted: true
    });
  };

  if (!selectedTask) return null;

  const taskIcon = getTaskTypeIcon(selectedTask.type?.name ?? "Other");
  const taskDeals = selectedTask.deal ? [selectedTask.deal] : [];

  const dummyTasks: CrmTaskType[] = [
    {
      id: 2,
      name: "Call with client",
      type: { id: 1, name: "Call", orderIndex: 0 },
      priority: CrmPriorityEnum.HIGH,
      isCompleted: false,
      dueAt: "2026-06-21T14:00:00",
      notes: "Follow up call about enterprise licensing.",
      owner: {
        employeeId: 1,
        firstName: "John",
        lastName: "Doe",
        authPic: null
      },
      contact: null,
      company: null,
      deal: null,
      isDeleted: false
    },
    {
      id: 3,
      name: "Prepare proposal",
      type: { id: 4, name: "Other", orderIndex: 3 },
      priority: CrmPriorityEnum.MEDIUM,
      isCompleted: true,
      dueAt: "2026-06-19T09:00:00",
      notes: "Prepare and send price proposal draft.",
      owner: {
        employeeId: 1,
        firstName: "John",
        lastName: "Doe",
        authPic: null
      },
      contact: null,
      company: null,
      deal: null,
      isDeleted: false
    }
  ];

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

          <div className="flex flex-col gap-3">
            <h2 className="h2">{translateText(["dealsTitle"])}</h2>
            <hr className="border-secondary-accent" />
            <SidePanelDealSection deals={taskDeals} />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="h2">{translateText(["relatedTasksTitle"])}</h2>
            <hr className="border-secondary-accent" />
            <SidePanelTasksSection
              tasks={dummyTasks}
            />
          </div>
        </div>

        <div className="w-[295px] shrink-0">
          <SidePanelTaskInfo task={selectedTask} onMarkAsDone={handleMarkAsDone} />
        </div>
      </div>
    </SidePanel>
  );
};

export default TaskDetailSidePanel;
