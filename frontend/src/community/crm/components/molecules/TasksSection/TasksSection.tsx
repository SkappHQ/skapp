import { Skeleton } from "@mui/material";
import {
  Avatar,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  PriorityIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetTasksByContactId,
  useUpdateTaskCompletion
} from "~community/crm/api/CrmApi";
import CheckTask from "~community/crm/components/atoms/CheckTask/CheckTask";
import AddTaskRow from "~community/crm/components/molecules/AddTaskRow/AddTaskRow";
import { ContactTask } from "~community/crm/types/CrmTaskTypes";
import {
  TaskTypeValue,
  getDueDateDisplay,
  getPriorityConfig,
  getTaskTypeConfig
} from "~community/crm/utils/crmTaskUtils";

import styles from "./styles";

interface Props {
  contactId: number;
}

const TasksSection: FC<Props> = ({ contactId }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data, isLoading } = useGetTasksByContactId(contactId);
  const tasks: ContactTask[] = data?.items ?? [];

  const { mutate: updateCompletion } = useUpdateTaskCompletion(
    () => {},
    () => {}
  );

  const handleToggleComplete = (id: number, isCompleted: boolean) => {
    updateCompletion({ id, isCompleted: !isCompleted });
  };

  return (
    <div className={styles.wrapper}>
      {/* Section header */}
      <div className={styles.header}>
        <p className={styles.title}>{translateText(["sectionHeader"])}</p>
      </div>

      {/* Divider */}
      <hr className={styles.divider} />

      {/* Loading skeleton */}
      {isLoading && (
        <div className={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={52} animation="wave" />
          ))}
        </div>
      )}

      {/* Task list */}
      {!isLoading && (tasks.length > 0 || isAddingTask) && (
        <div className={styles.taskList}>
          {tasks.map((task, idx) => {
            const typeConfig = getTaskTypeConfig(task.type.name);
            const priorityConfig = getPriorityConfig(task.priority);
            const dueDateDisplay = getDueDateDisplay(
              task.dueAt,
              task.isCompleted
            );
            const isLast = idx === tasks.length - 1 && !isAddingTask;

            return (
              <div key={task.id} className={isLast ? "" : styles.taskRowBorder}>
                <div className={styles.taskRow}>
                  {/* Completion toggle */}
                  <CheckTask
                    checked={task.isCompleted}
                    onChange={() =>
                      handleToggleComplete(task.id, task.isCompleted)
                    }
                    size="size-5"
                    ariaLabel={
                      task.isCompleted ? "Mark incomplete" : "Mark complete"
                    }
                  />

                  {/* Task type icon */}
                  <div
                    className={styles.typeIconCircle}
                    style={{ backgroundColor: typeConfig.bg }}
                    aria-hidden="true"
                  >
                    <Icon
                      name={typeConfig.iconName}
                      fill="white"
                      width="12"
                      height="12"
                    />
                  </div>

                  {/* Task name + due date */}
                  <div className={styles.taskContent}>
                    <p
                      className={
                        task.isCompleted
                          ? styles.taskNameCompleted
                          : styles.taskName
                      }
                    >
                      {task.name}
                    </p>
                    <p
                      className={`${styles.taskDueDateBase} ${dueDateDisplay.colorClass}`}
                    >
                      {dueDateDisplay.text}
                    </p>
                  </div>

                  {/* Priority + avatar */}
                  <div className={styles.taskActions}>
                    <PriorityIcon
                      icon={priorityConfig.icon}
                      bgColor={priorityConfig.bgColor}
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
              </div>
            );
          })}

          {/* Inline add-task row */}
          {isAddingTask && (
            <AddTaskRow
              placeholder={translateText(["addTaskPlaceholder"])}
              onSave={(_name: string, _type: TaskTypeValue) => {
                // TODO: Phase 8 — call create task mutation with name + type
                setIsAddingTask(false);
              }}
              onCancel={() => setIsAddingTask(false)}
              hasBorder={tasks.length > 0}
            />
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && tasks.length === 0 && !isAddingTask && (
        <div className={styles.emptyWrapper}>
          <EmptyDataView
            title={translateText(["emptyTitle"])}
            description={translateText(["emptyDescription"])}
            className={{ wrapper: "!h-auto !p-0 w-full" }}
          />
          <ButtonV2
            type="button"
            variant="line"
            size="sm"
            icon={<PlusIcon />}
            iconPosition="end"
            onClick={() => setIsAddingTask(true)}
          >
            {translateText(["addTaskButtonEmptyView"])}
          </ButtonV2>
        </div>
      )}

      {/* Add task link — shown only when tasks exist */}
      {!isAddingTask && tasks.length > 0 && (
        <ButtonV2
          type="button"
          variant="line"
          size="sm"
          onClick={() => setIsAddingTask(true)}
        >
          {translateText(["addTaskButton"])}
        </ButtonV2>
      )}
    </div>
  );
};

export default TasksSection;
