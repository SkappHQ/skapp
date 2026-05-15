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
import CheckTask from "~community/crm/components/atoms/CheckTask/CheckTask";
import AddTaskRow from "~community/crm/components/molecules/AddTaskRow/AddTaskRow";
import { CrmPriorityType, CrmTaskType } from "~community/crm/types/CommonTypes";
import {
  getDueDateDisplay,
  getPriorityConfig,
  getTaskTypeConfig
} from "~community/crm/utils/crmTaskUtils";

import styles from "./styles";
import AddIcon from "~community/common/assets/Icons/AddIcon";

const tasks = [
  {
    id: "1",
    name: "Task 1",
    isCompleted: false,
    type: {
      name: "email"
    },
    priority: {
      id: 1,
      name: "High",
      orderIndex: 1
    },
    dueAt: "2026-05-15",
    owner: {
      authPic: "",
      firstName: "John",
      lastName: "Doe"
    }
  },
  {
    id: "2",
    name: "Task 2",
    isCompleted: true,
    type: {
      name: "call"
    },
    priority: {
      id: 1,
      name: "Medium",
      orderIndex: 1
    },
    dueAt: "2026-05-16",
    owner: {
      authPic: "",
      firstName: "Jane",
      lastName: "Doe"
    }
  },
  {
    id: "3",
    name: "Task 2",
    isCompleted: true,
    type: {
      name: "call"
    },
    priority: {
      id: 1,
      name: "Medium",
      orderIndex: 1
    },
    dueAt: "2026-05-16",
    owner: {
      authPic: "",
      firstName: "Jane",
      lastName: "Doe"
    }
  }
];

const TasksSection: FC = () => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  return (
    <div className={styles.wrapper}>
      {/* Section header */}
      <div className={styles.header}>
        <p className={styles.title}>{"Deals"}</p>
      </div>

      {/* Divider */}
      <hr className={styles.divider} />

      {/* Task list */}

      <div className={styles.taskList}>
        {tasks.map((task, idx) => {
          const typeConfig = getTaskTypeConfig(task.type.name);
          const priorityConfig = getPriorityConfig(
            task.priority as CrmPriorityType
          );
          const dueDateDisplay = getDueDateDisplay(
            task.dueAt,
            task.isCompleted
          );

          return (
            <div key={task.id} className={task.id !== tasks[tasks.length - 1].id ? styles.taskRowBorder : ""}>
              <div className={styles.taskRow}>
                {/* Completion toggle */}
                <CheckTask
                  checked={task.isCompleted}
                  onChange={
                    () => {}
                    // handleToggleComplete(task.id, task.isCompleted)
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
      </div>
      {/* Add task link — shown only when tasks exist */}
      <div className="flex flex-row justify-start">
        <ButtonV2 type="button" variant="line" size="sm" onClick={() => {}} icon={<AddIcon/>} iconPosition="end">
          {"Add task"}
        </ButtonV2>
      </div>
    </div>
  );
};

export default TasksSection;
