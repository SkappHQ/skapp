import { EmptyDataView, PlusIcon, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import {
  PreselectedContact,
  TaskRowResponseType
} from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import SidePanelTasksList from "./SidePanelTasksList";

interface Props {
  tasks: TaskRowResponseType[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onTaskRowClick?: () => void;
  preselectedContact?: PreselectedContact | null;
  emptyDescription?: string;
}

const SidePanelTasksSection: FC<Props> = ({
  tasks,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick,
  preselectedContact,
  emptyDescription
}) => {
  const { setIsTaskModalOpen, setTaskModalType, setPreselectedContact } =
    useCrmStore((store) => ({
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType,
      setPreselectedContact: store.setPreselectedContact
    }));

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  const handleAddTask = () => {
    setPreselectedContact(preselectedContact);
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
      title={translateText(["tasks", "emptyTitle"])}
      description={
        emptyDescription ?? translateText(["tasks", "emptyDescription"])
      }
      button={{
        children: translateText(["tasks", "addTaskButtonEmptyView"]),
        variant: "tertiary",
        onClick: handleAddTask,
        icon: <PlusIcon />,
        "aria-label": translateText(["tasks", "addTaskButtonEmptyView"])
      }}
      className={{
        wrapper: "h-[14.25rem] bg-secondary-background rounded-lg"
      }}
    />
  );
};

export default SidePanelTasksSection;
