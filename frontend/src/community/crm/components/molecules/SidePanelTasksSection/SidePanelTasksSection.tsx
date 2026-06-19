import { EmptyDataView, PlusIcon, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import SidePanelTasksList from "./SidePanelTasksList";

interface Props {
  tasks: TaskRowResponseType[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onTaskRowClick?: () => void;
  emptyDescription?: string;
}

const SidePanelTasksSection: FC<Props> = ({
  tasks,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick,
  emptyDescription
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );
  const { setIsTaskModalOpen, setTaskModalType } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    setTaskModalType: store.setTaskModalType
  }));

  const handleAddTask = () => {
    setTaskModalType(CrmModalTypes.ADD_TASK_MODAL);
    setIsTaskModalOpen(true);
  };

  return tasks.length > 0 ? (
    <SidePanelTasksList
      tasks={tasks}
      isCheckTaskVisible={isCheckTaskVisible}
      isShowContact={isShowContact}
      onTaskRowClick={onTaskRowClick}
      onAddTask={handleAddTask}
    />
  ) : (
    <EmptyDataView
      icon={<SearchIcon width="24" height="24" />}
      title={translateText(["emptyTitle"])}
      description={emptyDescription ?? translateText(["emptyDescription"])}
      button={{
        children: translateText(["addTaskButtonEmptyView"]),
        variant: "tertiary",
        onClick: handleAddTask,
        icon: <PlusIcon />,
        "aria-label": translateText(["addTaskButtonEmptyView"])
      }}
      className={{
        wrapper: "h-[228px] bg-secondary-background rounded-lg"
      }}
    />
  );
};

export default SidePanelTasksSection;
