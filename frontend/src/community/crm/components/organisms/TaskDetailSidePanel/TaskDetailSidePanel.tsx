import {
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { getTaskTypeIcon } from "~community/crm/utils/taskHelpers";

const TaskDetailSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const {
    selectedTask,
    setSelectedTask,
    setIsCrmSidePanelOpen
  } = useCrmStore((store) => ({
    selectedTask: store.selectedTask,
    setSelectedTask: store.setSelectedTask,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
  }));


  const handleClose = (): void => {
    setSelectedTask(null);
    setIsCrmSidePanelOpen(false);
    if (onClose) onClose();
  };


  const taskIcon = getTaskTypeIcon(selectedTask.type?.name ?? "Other");


  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      width="lg"
      animation="slide"
      closeOnBackdropClick
      header={
        <div className="flex flex-col gap-3 pl-2">
          <div className="flex items-center gap-2">
            {taskIcon}
            <span className="body1 text-primary-text font-semibold">
              {selectedTask.name}
            </span>
          </div>
        </div>
      }
    />
  );
};

export default TaskDetailSidePanel;
