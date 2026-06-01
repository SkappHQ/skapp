import { Avatar, CheckTask, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ContactTask } from "~community/crm/types/CommonTypes";
import {
  getDueDateDisplay,
  getPriorityConfig,
  getTaskTypeConfig
} from "~community/crm/utils/crmTaskUtils";

import styles from "./styles";

interface Props {
  task: ContactTask;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
  isLastBeforeForm?: boolean;
}

const SidePanelTaskRow: FC<Props> = ({
  task,
  onToggleComplete,
  isLastBeforeForm = false
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const priorityConfig = getPriorityConfig(task.priority);
  const dueDateDisplay = getDueDateDisplay(task.dueAt, task.isCompleted);

  return (
    <div
      className={`${styles.row}${isLastBeforeForm ? " rounded-b-none!" : ""}`}
    >
      <CheckTask
        checked={task.isCompleted}
        onChange={(checked) => onToggleComplete(task.id, checked)}
        aria-label={translateText(
          [
            task.isCompleted
              ? "checkTaskMarkComplete"
              : "checkTaskMarkIncomplete"
          ],
          { name: task.name }
        )}
      />

      <div className={styles.typeIcon}>{getTaskTypeConfig(task.type.name)}</div>

      <div className={styles.content}>
        <p className={task.isCompleted ? styles.nameCompleted : styles.name}>
          {task.name}
        </p>
        <p
          className={`${task.isCompleted ? styles.dueDateCompleted : `${styles.dueDateBase} ${dueDateDisplay.colorClass}`}`}
        >
          {dueDateDisplay.text}
        </p>
      </div>

      <div className={styles.actions}>
        <PriorityIcon
          icon={priorityConfig.icon}
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
