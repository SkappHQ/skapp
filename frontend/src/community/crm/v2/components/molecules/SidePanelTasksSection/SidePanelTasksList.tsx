import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import TaskRow from "~community/crm/v2/components/molecules/TaskRow/TaskRow";

interface Props {
  taskIds: number[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onTaskRowClick?: () => void;
  onAddTask: () => void;
  showAddTaskAction?: boolean;
}

const SidePanelTasksList: FC<Props> = ({
  taskIds,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick,
  onAddTask,
  showAddTaskAction = true
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  return (
    <>
      <div className="border border-secondary-accent rounded-lg divide-y divide-secondary-accent w-full overflow-hidden">
        {taskIds.map((taskId) => (
          <TaskRow
            key={taskId}
            taskId={taskId}
            isCheckTaskVisible={isCheckTaskVisible}
            onRowClick={onTaskRowClick}
            isShowContact={isShowContact}
          />
        ))}
      </div>
      {showAddTaskAction && (
        <div className=" flex">
          <ButtonV2
            type="button"
            variant="line"
            size="sm"
            icon={<PlusIcon />}
            iconPosition="end"
            onClick={onAddTask}
          >
            {translateText(["addTaskButtonEmptyView"])}
          </ButtonV2>
        </div>
      )}
    </>
  );
};

export default SidePanelTasksList;
