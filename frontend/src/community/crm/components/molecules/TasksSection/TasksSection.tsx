import { Skeleton } from "@mui/material";
import {
  Avatar,
  EmptyDataView,
  ItemAddForm,
  PlusIcon,
  PriorityIcon,
  TransparentEnterIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetTasksByCompanyId,
  useUpdateTaskCompletion
} from "~community/crm/api/CrmApi";
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
  companyId: number;
}

interface FormPos {
  top: number;
  left: number;
  width: number;
}

const MOCK_TASKS: CrmTaskType[] = [
  {
    id: 101,
    name: "Follow up email regarding pricing details",
    type: { id: 1, name: "email", orderIndex: 1 },
    priority: { id: 1, name: "high", orderIndex: 1 },
    isCompleted: false,
    dueAt: new Date(Date.now() + 86400000).toISOString(),
    notes: "Send the updated pricing sheet with volume discounts.",
    owner: {
      employeeId: 1,
      firstName: "Alex",
      lastName: "Mercer",
      authPic: null
    },
    contact: null,
    company: null,
    deal: null,
    isDeleted: false
  },
  {
    id: 102,
    name: "Introductory phone call with decision maker",
    type: { id: 2, name: "call", orderIndex: 2 },
    priority: { id: 2, name: "medium", orderIndex: 2 },
    isCompleted: false,
    dueAt: new Date().toISOString(),
    notes: "Qualify budget and timeline.",
    owner: {
      employeeId: 2,
      firstName: "Sarah",
      lastName: "Connor",
      authPic: null
    },
    contact: null,
    company: null,
    deal: null,
    isDeleted: false
  },
  {
    id: 103,
    name: "Product demonstration and Q&A session",
    type: { id: 3, name: "meeting", orderIndex: 3 },
    priority: { id: 3, name: "high", orderIndex: 1 },
    isCompleted: true,
    dueAt: new Date(Date.now() - 86400000).toISOString(),
    notes: "Walk through key integration options.",
    owner: {
      employeeId: 1,
      firstName: "Alex",
      lastName: "Mercer",
      authPic: null
    },
    contact: null,
    company: null,
    deal: null,
    isDeleted: false
  },
  {
    id: 104,
    name: "Review contract terms and prepare proposal",
    type: { id: 4, name: "other", orderIndex: 4 },
    priority: { id: 4, name: "low", orderIndex: 3 },
    isCompleted: false,
    dueAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    notes: "Align with legal department on standard terms.",
    owner: {
      employeeId: 3,
      firstName: "John",
      lastName: "Doe",
      authPic: null
    },
    contact: null,
    company: null,
    deal: null,
    isDeleted: false
  }
];

const TasksSection: FC<Props> = ({ companyId }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const [isAddingTask, setIsAddingTask] = useState(false);

  const formAnchorRef = useRef<HTMLDivElement>(null);
  const [formPos, setFormPos] = useState<FormPos | null>(null);

  useEffect(() => {
    if (!isAddingTask) {
      setFormPos(null);
      return;
    }

    const update = () => {
      if (!formAnchorRef.current) return;
      const r = formAnchorRef.current.getBoundingClientRect();
      setFormPos({ top: r.top, left: r.left, width: r.width });
    };

    update();

    // Re-sync position when the panel is scrolled or the window is resized
    let scrollEl: HTMLElement | null = null;
    let node = formAnchorRef.current?.parentElement ?? null;
    while (node) {
      const oy = window.getComputedStyle(node).overflowY;
      if (oy === "auto" || oy === "scroll") {
        scrollEl = node;
        break;
      }
      node = node.parentElement;
    }

    scrollEl?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      scrollEl?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isAddingTask]);

  const { data } = useGetTasksByCompanyId(companyId);
  const apiTasks: CrmTaskType[] = data?.items ?? [];
  const [tasks, setTasks] = useState<CrmTaskType[]>([]);

  const isLoading = false;

  useEffect(() => {
    if (apiTasks.length > 0) {
      setTasks(apiTasks);
    } else {
      setTasks((prev) => (prev.length > 0 ? prev : MOCK_TASKS));
    }
  }, [apiTasks]);

  const { mutate: updateCompletion } = useUpdateTaskCompletion(
    () => { },
    () => { }
  );
  const handleToggleComplete = (id: number, isCompleted: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted } : t))
    );
    updateCompletion({ id, isCompleted });
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
                      onChange={(checked) =>
                        handleToggleComplete(task.id, checked)
                      }
                      size="size-5"
                      ariaLabel={
                        task.isCompleted ? "Mark incomplete" : "Mark complete"
                      }
                    />

                    <div className={styles.typeIconCircle}>
                      <Icon
                        name={typeConfig.iconName}
                        width="20px"
                        height="20px"
                        svgProps={{ className: "w-5! h-5!" }}
                      />
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
              <div
                ref={formAnchorRef}
                className={`h-[60px]${hasTasks ? " border-t border-[#e5e7eb]" : ""}`}
              />
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

      {isAddingTask &&
        formPos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: formPos.top,
              left: formPos.left,
              width: formPos.width,
              zIndex: 1270
            }}
          >
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
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default TasksSection;
