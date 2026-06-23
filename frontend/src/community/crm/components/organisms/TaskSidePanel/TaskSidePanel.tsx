import {
  DeleteButtonIcon,
  KebabMenu,
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const TaskSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const { setIsTaskModalOpen, setTaskModalType } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    setTaskModalType: store.setTaskModalType
  }));

  const openTaskModal = (type: CrmModalTypes) => {
    setTaskModalType(type);
    setIsTaskModalOpen(true);
  };

  const menuItems = [
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
      onClose={onClose}
      closeOnBackdropClick
      headerActions={
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
      }
    >
      <div className="flex flex-col pb-4 gap-[16px]">
        {/* Task details content will be implemented here */}
      </div>
    </SidePanel>
  );
};

export default TaskSidePanel;
