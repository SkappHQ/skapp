import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import TaskRow from "~community/crm/v2/components/molecules/TaskRow/TaskRow";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface SidePanelTasksListProps {
  tasks: CrmTaskEntity[];
  onAddTask: () => void;
  isAddTaskDisabled?: boolean;
  showAddTaskAction?: boolean;
  onRowClick?: (taskId: number) => void;
  onToggleComplete: (taskId: number, isCompleted: boolean) => void;
}

const SidePanelTasksList: FC<SidePanelTasksListProps> = ({
  tasks,
  onAddTask,
  isAddTaskDisabled,
  showAddTaskAction = true,
  onRowClick,
  onToggleComplete
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
        {tasks.map((task) =>
          task.id ? (
            <TaskRow
              key={task.id}
              task={task}
              taskId={task.id}
              onRowClick={onRowClick ?? (() => undefined)}
              onToggleComplete={onToggleComplete}
            />
          ) : null
        )}
      </div>
      {showAddTaskAction && (
        <div className="flex">
          <ButtonV2
            type="button"
            variant="line"
            size="sm"
            icon={<PlusIcon />}
            iconPosition="end"
            onClick={onAddTask}
            disabled={isAddTaskDisabled}
            isLoading={isAddTaskDisabled}
          >
            {translateText(["addTaskButtonEmptyView"])}
          </ButtonV2>
        </div>
      )}
    </>
  );
};

export default SidePanelTasksList;
