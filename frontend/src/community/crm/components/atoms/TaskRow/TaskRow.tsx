import { Avatar, CheckTask, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTaskCompletion } from "~community/crm/api/TaskApi";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import {
  getDueDateDisplay,
  getPriorityConfig,
  getTaskTypeIcon
} from "~community/crm/utils/taskUtil";

interface Props {
  task: CrmTaskType;
  onRowClick?: () => void;
  showContact?: boolean;
  isCompletedTab?: boolean;
  className?: string;
}

const TaskRow: FC<Props> = ({
  task,
  onRowClick,
  showContact = true,
  isCompletedTab = false,
  className = "w-full"
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const { setToastMessage } = useToast();
  const { mutate: updateCompletion } = useUpdateTaskCompletion(() => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toggleErrorTitle"]),
      description: translateText(["toggleErrorDescription"])
    });
  });

  const priorityConfig = getPriorityConfig(task.priority);
  const taskTypeIcon = getTaskTypeIcon(task.type.name);
  const dueDateDisplay = getDueDateDisplay(task.dueAt, task.isCompleted);

  const handleToggleChange = (checked: boolean) => {
    if (isCompletedTab) return;
    updateCompletion({ id: task.id, isCompleted: checked });
  };

  const showCompletedStyle = !isCompletedTab && task.isCompleted;
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

      {showCompletedStyle && (
        <div className="relative z-10 shrink-0 flex items-center justify-center pr-1">
          <CheckTask
            checked={task.isCompleted}
            onChange={handleToggleChange}
            defaultChecked={task.isCompleted}
            aria-label={translateText(
              [
                task.isCompleted
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
        {taskTypeIcon}
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

      <div
        className={`relative z-10 flex items-center gap-6 shrink-0 ${showCompletedStyle ? "opacity-40" : ""}`}
      >
        {priorityConfig && PriorityIconComp && (
          <PriorityIcon
            icon={priorityConfig}
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
