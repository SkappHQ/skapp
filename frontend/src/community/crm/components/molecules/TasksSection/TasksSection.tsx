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

// import { useEffect, useRef } from "react"; // manual-portal refs (commented out)
// import { createPortal } from "react-dom"; // manual portal (commented out)
import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetTasksByContactId,
  useUpdateTaskCompletion
} from "~community/crm/api/CrmContactsApi";
import CheckTask from "~community/crm/components/atoms/CheckTask/CheckTask";
import { ContactTask } from "~community/crm/types/CommonTypes";
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

// interface FormPos {  // manual-portal position type (commented out)
//   top: number;
//   left: number;
//   width: number;
// }

const TasksSection: FC<Props> = ({ contactId }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const [isAddingTask, setIsAddingTask] = useState(false);

  // --- manual-portal mechanism commented out (testing skapp-ui usePortal instead) ---
  // const formAnchorRef = useRef<HTMLDivElement>(null);
  // const [formPos, setFormPos] = useState<FormPos | null>(null);
  // useEffect(() => {
  //   if (!isAddingTask) { setFormPos(null); return; }
  //   const update = () => {
  //     if (!formAnchorRef.current) return;
  //     const r = formAnchorRef.current.getBoundingClientRect();
  //     setFormPos({ top: r.top, left: r.left, width: r.width });
  //   };
  //   update();
  //   let scrollEl: HTMLElement | null = null;
  //   let node = formAnchorRef.current?.parentElement ?? null;
  //   while (node) {
  //     const oy = window.getComputedStyle(node).overflowY;
  //     if (oy === "auto" || oy === "scroll") { scrollEl = node; break; }
  //     node = node.parentElement;
  //   }
  //   scrollEl?.addEventListener("scroll", update);
  //   window.addEventListener("resize", update);
  //   return () => { scrollEl?.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  // }, [isAddingTask]);
  // --- end manual-portal mechanism ---

  const { data, isLoading } = useGetTasksByContactId(contactId);
  const tasks: ContactTask[] = data ?? [];
  const { mutate: updateCompletion } = useUpdateTaskCompletion(
    () => {},
    () => {}
  );
  const handleToggleComplete = (id: number, isCompleted: boolean) => {
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

                    <div>{getTaskTypeConfig(task.type.name)}</div>

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

            {/* skapp-ui usePortal test: ItemAddForm rendered inline with usePortal={true} */}
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

      {/* manual-portal ItemAddForm commented out — using inline usePortal={true} above instead */}
      {/* {isAddingTask && formPos && createPortal(
        <div style={{ position: "fixed", top: formPos.top, left: formPos.left, width: formPos.width, zIndex: 1270 }}>
          <ItemAddForm ... />
        </div>,
        document.body
      )} */}
    </div>
  );
};

export default TasksSection;
