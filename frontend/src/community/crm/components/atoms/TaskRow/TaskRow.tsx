import { Avatar, CheckTask, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getPriorityConfig,
  getTaskTypeIcon
} from "~community/crm/constants/taskConstants";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import { getDueDateDisplay } from "~community/crm/utils/taskUtil";

interface Props {
  task: CrmTaskType;
  onToggleComplete?: (id: number, isCompleted: boolean) => Promise<void>;
  onRowClick?: () => void;
  showContact?: boolean;
  className?: string;
}

const TaskRow: FC<Props> = ({
  task,
  onToggleComplete,
  onRowClick,
  showContact = false,
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
      await onToggleComplete?.(task.id, checked);
    } catch {
      setOptimisticCompleted(task.isCompleted);
    }
  };

  const showCompletedStyle = !!onToggleComplete && optimisticCompleted;
  const showInlineContact = showContact && !!task.contact;

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

      {onToggleComplete && (
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
      )}

      <div
        className={`relative z-10 shrink-0 flex items-center justify-center ${showCompletedStyle ? "opacity-40" : ""}`}
      >
        {TaskTypeIcon && <TaskTypeIcon />}
      </div>

      <div className="relative z-10 flex-1 min-w-0">
        <p
          className={`body2 leading-snug truncate ${showCompletedStyle ? "line-through text-secondary-icon" : "text-black"}`}
        >
          {task.name}
        </p>
        {(dueDateDisplay || showInlineContact) && (
          <p className="body3 leading-none mt-0.5 flex items-center gap-2">
            {dueDateDisplay && (
              <span
                className={
                  showCompletedStyle
                    ? "line-through text-secondary-icon"
                    : dueDateDisplay.colorClass
                }
              >
                {translateText([dueDateDisplay.textKey], {
                  date: dueDateDisplay.dateValue ?? ""
                })}
              </span>
            )}
            {dueDateDisplay && showInlineContact && (
              <span className="w-1 h-1 rounded-full bg-secondary-accent shrink-0" />
            )}
            {showInlineContact && (
              <span
                className={
                  showCompletedStyle
                    ? "line-through text-secondary-icon"
                    : "text-secondary-text"
                }
              >
                {task.contact!.name}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="relative z-10 flex items-center gap-6 shrink-0">
        {priorityConfig && PriorityIconComp && (
          <PriorityIcon
            icon={<PriorityIconComp />}
            bgColor={priorityConfig.backgroundColor}
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
