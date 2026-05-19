import { Skeleton } from "@mui/material";
import {
  Avatar,
  EmptyDataView,
  ItemAddForm,
  PlusIcon,
  PriorityIcon,
  TransparentEnterIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetTasksByContactId,
  useUpdateTaskCompletion
} from "~community/crm/api/CrmContactsApi";
import CheckTask from "~community/crm/components/atoms/CheckTask/CheckTask";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import {
  TASK_TYPE_OPTIONS,
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
  const tasks: CrmTaskType[] = data?.items ?? [];
  const { mutate: updateCompletion } = useUpdateTaskCompletion(
    () => {},
    () => {}
  );
  const handleToggleComplete = (id: number, isCompleted: boolean) => {
    updateCompletion({ id, isCompleted: !isCompleted });
  };

  const hasTasks = tasks.length > 0;

  return (
    <div className={styles.wrapper}>
      {/* Section header */}
      <div className={styles.header}>
        <p className={styles.title}>{translateText(["sectionHeader"])}</p>
      </div>

      <hr className={styles.divider} />

      {/* Loading skeletons */}
      {isLoading && (
        <div className={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={52} animation="wave" />
          ))}
        </div>
      )}

      {/* Task list */}
      {!isLoading && (hasTasks || isAddingTask) && (
        <div className={styles.taskSection}>
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
                <div
                  key={task.id}
                  className={isLast ? "" : styles.taskRowBorder}
                >
                  <div className={styles.taskRow}>
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

                    <div
                      className={styles.typeIconCircle}
                      style={{ backgroundColor: typeConfig.bg }}
                      aria-hidden="true"
                    >
                      {task.type.name.toLowerCase() === "email" ? (
                        <div className="flex items-center justify-center h-full w-full">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 6.5L2 4V9H10V4L6 6.5Z"
                              fill="white"
                              fillOpacity="0.3"
                            />
                            <path
                              d="M2 2.5H10C10.275 2.5 10.5 2.725 10.5 3V9C10.5 9.275 10.275 9.5 10 9.5H2C1.725 9.5 1.5 9.275 1.5 9V3C1.5 2.725 1.725 2.5 2 2.5Z"
                              stroke="white"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M1.5 3.25L6 6L10.5 3.25"
                              stroke="white"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      ) : task.type.name.toLowerCase() === "call" ||
                        task.type.name.toLowerCase() === "phone" ? (
                        <div className="flex items-center justify-center h-full w-full">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              opacity="0.3"
                              d="M7.50005 8.915C8.14505 9.185 8.81505 9.36 9.50005 9.45V8.335L8.32505 8.1L7.50005 8.915ZM3.66505 2.5H2.55005C2.64005 3.185 2.81505 3.85 3.08505 4.5L3.90005 3.675L3.66505 2.5Z"
                              fill="white"
                            />
                            <path
                              d="M10.0999 7.435L8.26495 7.07C8.01495 7.02 7.84995 7.17 7.81495 7.205L6.55495 8.455C5.30495 7.74 4.26995 6.705 3.55495 5.455L4.80495 4.195C4.91995 4.075 4.96995 3.91 4.93995 3.745L4.56495 1.9C4.51995 1.67 4.31495 1.5 4.07495 1.5H1.99995C1.71995 1.5 1.48495 1.735 1.49995 2.015C1.58495 3.46 2.02495 4.815 2.71495 6C3.50495 7.365 4.63995 8.495 5.99995 9.285C7.18495 9.97 8.53995 10.415 9.98495 10.5C10.2599 10.515 10.4999 10.285 10.4999 10V7.925C10.4999 7.685 10.3299 7.48 10.0999 7.435ZM2.54995 2.5H3.66495L3.89995 3.675L3.08495 4.5C2.81495 3.85 2.63495 3.185 2.54995 2.5ZM9.49995 9.45C8.81495 9.36 8.14995 9.185 7.49995 8.915L8.32495 8.1L9.49995 8.335V9.45Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <Icon
                            name={typeConfig.iconName}
                            fill="white"
                            width="12"
                            height="12"
                          />
                        </div>
                      )}
                    </div>

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

                    <div className={styles.taskActions}>
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
                </div>
              );
            })}

            {isAddingTask && (
              <div className={hasTasks ? "border-t border-[#e5e7eb]" : ""}>
                <ItemAddForm
                  itemTypeOptions={TASK_TYPE_OPTIONS}
                  defaultSelectedItemType={TASK_TYPE_OPTIONS[0]?.value}
                  onSave={(_value: string, _itemType?: string) => {
                    // TODO: wire up create-task mutation
                    setIsAddingTask(false);
                  }}
                  onCancel={() => setIsAddingTask(false)}
                  inputFieldPlaceholder={translateText(["addTaskPlaceholder"])}
                  maxLength={255}
                  actionButton={{
                    variant: "outlined",
                    icon: <TransparentEnterIcon />
                  }}
                  className={hasTasks ? "rounded-b-lg" : "rounded-lg"}
                  usePortal={true}
                />
              </div>
            )}
          </div>

          {!isAddingTask && hasTasks && (
            <button
              type="button"
              className={styles.addTaskBtn}
              onClick={() => setIsAddingTask(true)}
            >
              {translateText(["addTaskButtonEmptyView"])}
              <PlusIcon />
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasTasks && !isAddingTask && (
        <div className={styles.emptyWrapper}>
          <EmptyDataView
            icon={<SearchIcon width="24" height="24" fill="#71717A" />}
            title={translateText(["emptyTitle"])}
            description={translateText(["emptyDescription"])}
            className={{
              wrapper: styles.emptyDataViewWrapper,
              title: styles.emptyTitle,
              description: styles.emptyDesc
            }}
          />
          <button
            type="button"
            className={styles.emptyAddTaskBtn}
            onClick={() => setIsAddingTask(true)}
          >
            {translateText(["addTaskButtonEmptyView"])}
            <PlusIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default TasksSection;
