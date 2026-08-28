import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import TaskRow from "~community/crm/v2/components/molecules/TaskRow/TaskRow";

interface SidePanelTasksListProps {
  taskIds: number[];
  onAddTask: () => void;
}

const SidePanelTasksList: FC<SidePanelTasksListProps> = ({
  taskIds,
  onAddTask
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
          <TaskRow key={taskId} taskId={taskId} />
        ))}
      </div>
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
    </>
  );
};

export default SidePanelTasksList;
