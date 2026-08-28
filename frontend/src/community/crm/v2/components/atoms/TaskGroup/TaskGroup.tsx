import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import TaskRow from "~community/crm/v2/components/molecules/TaskRow/TaskRow";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";

interface Props {
  label?: string;
  taskIds: number[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
}

const TaskGroup: FC<Props> = ({
  label,
  taskIds,
  isCheckTaskVisible = true,
  isShowContact = true
}) => {
  const { setSelectedTaskId, openCrmSidePanel } = useCrmStoreV2(
    useShallow((store) => ({
      setSelectedTaskId: store.setSelectedTaskId,
      openCrmSidePanel: store.openCrmSidePanel
    }))
  );

  const handleRowClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    openCrmSidePanel(CrmSidePanelTypes.TASK_SIDE_PANEL);
  };

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
            isShowContact={isShowContact}
            onRowClick={() => handleRowClick(taskId)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskGroup;
