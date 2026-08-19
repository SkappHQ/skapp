import { FC } from "react";

import TaskRow from "~community/crm/v2/components/molecules/TaskRow/TaskRow";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";

interface TaskGroupProps {
  label?: string;
  taskIds: number[];
  isCheckTaskVisible?: boolean;
}

const TaskGroup: FC<TaskGroupProps> = ({
  label,
  taskIds,
  isCheckTaskVisible = true
}) => {
  const { setSelectedTaskId, openCrmSidePanel } = useCrmStoreV2((state) => ({
    setSelectedTaskId: state.setSelectedTaskId,
    openCrmSidePanel: state.openCrmSidePanel
  }));

  return (
    <div className="flex flex-col">
      {label && (
        <div className="subtitle2 mb-2 sticky top-0 bg-white z-10">{label}</div>
      )}
      <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
        {taskIds.map((taskId) => (
          <TaskRow
            key={taskId}
            taskId={taskId}
            isCheckTaskVisible={isCheckTaskVisible}
            isShowContact={true}
            onRowClick={() => {
              setSelectedTaskId(taskId);
              openCrmSidePanel(CrmSidePanelTypes.TASK_SIDE_PANEL);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskGroup;
