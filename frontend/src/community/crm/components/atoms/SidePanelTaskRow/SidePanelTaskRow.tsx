import { Avatar, CheckTask, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, useEffect, useState } from "react";

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
}

const SidePanelTaskRow: FC<Props> = ({
  task,
  onToggleComplete,
  onRowClick
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const priorityConfig = getPriorityConfig(task.priority);
  const TaskTypeIcon = getTaskTypeIcon(task.type.name);
  const PriorityIconComp = priorityConfig.IconComponent;
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
      // Revert to server state on failure
      setOptimisticCompleted(task.isCompleted);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick?.();
    }
  };

  return (
    <div
      className={[
        "flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white [&:first-child]:rounded-t-[8px] [&:last-child]:rounded-b-[8px]",
        onRowClick && "cursor-pointer hover:bg-gray-50"
      ]
        .filter(Boolean)
        .join(" ")}
      {...(onRowClick && {
        role: "button",
        tabIndex: 0,
        onClick: onRowClick,
        onKeyDown: handleKeyDown,
        "aria-label": `Open details for task: ${task.name}`
      })}
    >
      <div onClick={(e) => e.stopPropagation()}>
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

      <div className="shrink-0 flex items-center justify-center">
        <TaskTypeIcon />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={
            optimisticCompleted
              ? "text-sm text-black line-through leading-snug truncate"
              : "text-sm text-black leading-snug truncate"
          }
        >
          {task.name}
        </p>
        <p
          className={
            optimisticCompleted
              ? "text-xs leading-none mt-0.5 line-through text-gray-600"
              : `text-xs leading-none mt-0.5 ${dueDateDisplay.colorClass}`
          }
        >
          {translateText(
            [dueDateDisplay.textKey],
            dueDateDisplay.dateValue
              ? { date: dueDateDisplay.dateValue }
              : undefined
          )}
        </p>
      </div>

      <div
        className="flex items-center gap-6 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <PriorityIcon
          icon={<PriorityIconComp />}
          bgColor={priorityConfig.bgColor}
          className="w-8! h-8!"
        />
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

export default SidePanelTaskRow;
