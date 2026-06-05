import { Avatar, CheckTask, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getPriorityConfig,
  getTaskTypeIcon
} from "~community/crm/constants/crmTaskConstants";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import { getDueDateDisplay } from "~community/crm/utils/crmTaskUtils";

interface Props {
  task: CrmTaskType;
  onToggleComplete: (id: number, isCompleted: boolean) => Promise<void>;
  // TODO: wire up to CRM store once TaskDetailPanel is implemented
  onRowClick?: () => void;
  className?: string;
}

const TaskRow: FC<Props> = ({
  task,
  onToggleComplete,
  onRowClick,
  className = "w-full"
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const priorityConfig = getPriorityConfig(task.priority);
  const TaskTypeIcon = getTaskTypeIcon(task.type.name);
  const PriorityIconComp = priorityConfig?.IconComponent;
  const dueDateDisplay = getDueDateDisplay(task.dueAt, task.isCompleted);

  const [optimisticCompleted, setOptimisticCompleted] = useState(
    task.isCompleted
  );

  useEffect(() => {
    setOptimisticCompleted(task.isCompleted);
  }, [task.isCompleted]);

  const handleToggleChange = async (checked: boolean) => {
    setOptimisticCompleted(checked);
    try {
      await onToggleComplete(task.id, checked);
    } catch {
      setOptimisticCompleted(task.isCompleted);
    }
  };

  return (
    <div
      className={`relative flex items-center gap-4 p-3 min-w-0 ${className} min-h-[63px] bg-white hover:bg-gray-50 overflow-hidden`}
    >
      <button
        type="button"
        className="absolute inset-0 appearance-none border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-inset"
        aria-label={translateText(["openTaskDetails"], { name: task.name })}
        onClick={onRowClick}
      />

      <div className="relative z-10 shrink-0 flex items-center justify-center pr-1">
        <CheckTask
          checked={optimisticCompleted}
          onChange={handleToggleChange}
          aria-label={translateText(
            [
              optimisticCompleted
                ? "checkTaskMarkIncomplete"
                : "checkTaskMarkComplete"
            ],
            { name: task.name }
          )}
        />
      </div>

      <div className="relative z-10 shrink-0 flex items-center justify-center">
        {TaskTypeIcon && <TaskTypeIcon />}
      </div>

      <div className="relative z-10 flex-1 min-w-0">
        <p
          className={`body2 text-black leading-snug truncate ${optimisticCompleted ? "line-through" : ""}`}
        >
          {task.name}
        </p>
        <p
          className={`body3 leading-none mt-0.5 ${optimisticCompleted ? "line-through text-secondary-text" : dueDateDisplay.colorClass}`}
        >
          {translateText([dueDateDisplay.textKey], {
            date: dueDateDisplay.dateValue ?? ""
          })}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-6 shrink-0">
        {priorityConfig && PriorityIconComp && (
          <PriorityIcon
            icon={<PriorityIconComp />}
            bgColor={priorityConfig.bgColor}
          />
        )}
        {task.owner && (
          <Avatar
            id={`task-owner-${task.id}`}
            size="xs"
            src={task.owner.authPic ?? undefined}
            firstName={task.owner.firstName}
            lastName={task.owner.lastName ?? undefined}
          />
        )}
      </div>
    </div>
  );
};

export default TaskRow;
