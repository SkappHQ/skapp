import { Avatar, CheckTask, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import {
  getDueDateDisplay,
  getPriorityConfig,
  getTaskTypeConfig
} from "~community/crm/utils/crmTaskUtils";

import styles from "./styles";

interface Props {
  task: CrmTaskType;
  onToggleComplete: (id: number, isCompleted: boolean) => Promise<void>;
  hasFormBelow?: boolean;
  // TODO: wire up to CRM store once TaskDetailPanel is implemented
  onRowClick?: () => void;
}

const SidePanelTaskRow: FC<Props> = ({
  task,
  onToggleComplete,
  hasFormBelow = false,
  onRowClick
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const priorityConfig = getPriorityConfig(task.priority);
  const dueDateDisplay = getDueDateDisplay(task.dueAt, task.isCompleted);

  // Optimistic UI: immediately reflect the toggle, revert if the API call fails
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
        styles.row,
        hasFormBelow && styles.rowLastBeforeForm,
        onRowClick && styles.rowClickable
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

      <div className={styles.typeIcon}>{getTaskTypeConfig(task.type.name)}</div>

      <div className={styles.content}>
        <p className={optimisticCompleted ? styles.nameCompleted : styles.name}>
          {task.name}
        </p>
        <p
          className={`${optimisticCompleted ? styles.dueDateCompleted : `${styles.dueDateBase} ${dueDateDisplay.colorClass}`}`}
        >
          {translateText(
            [dueDateDisplay.textKey],
            dueDateDisplay.dateValue
              ? { date: dueDateDisplay.dateValue }
              : undefined
          )}
        </p>
      </div>

      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        <PriorityIcon
          icon={priorityConfig.icon}
          bgColor={priorityConfig.bgColor}
          className={styles.priorityIcon}
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
