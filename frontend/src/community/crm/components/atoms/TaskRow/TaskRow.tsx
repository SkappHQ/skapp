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
  isCheckTaskVisible?: boolean;
  className?: string;
}

const TaskRow: FC<Props> = ({
  task,
  onRowClick,
  showContact = false,
  isCheckTaskVisible = true,
  className
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

  const dueDateDisplay = getDueDateDisplay(task.dueAt, task.isCompleted);

  const handleToggleChange = (checked: boolean) => {
    updateCompletion({ id: task.id, isCompleted: checked });
  };

  const isCompletedStyleVisible = !isCheckTaskVisible && task.isCompleted;
  const isInlineContactVisible = showContact && task.contact;

  return (
    <div
      className={`relative flex items-center gap-4 p-3 min-w-0 ${className} min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden`}
      onClick={onRowClick}
    >
      {isCompletedStyleVisible && (
        <div
          className="shrink-0 flex items-center justify-center pr-1"
          onClick={(e) => e.stopPropagation()}
        >
          <CheckTask
            checked={task.isCompleted}
            onChange={handleToggleChange}
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
        className={`shrink-0 flex items-center justify-center ${isCompletedStyleVisible ? "opacity-40" : ""}`}
      >
        {getTaskTypeIcon(task.type.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`body2 leading-snug truncate ${isCompletedStyleVisible ? "line-through text-secondary-icon" : "text-black"}`}
        >
          {task.name}
        </p>
        {(dueDateDisplay || isInlineContactVisible) && (
          <p className="body3 leading-none mt-0.5 flex items-center gap-2">
            {dueDateDisplay && (
              <span
                className={
                  isCompletedStyleVisible
                    ? "line-through text-secondary-icon"
                    : dueDateDisplay.colorClass
                }
              >
                {translateText([dueDateDisplay.textKey], {
                  date: dueDateDisplay.dateValue ?? ""
                })}
              </span>
            )}
            {dueDateDisplay && isInlineContactVisible && (
              <span className="w-1 h-1 rounded-full bg-secondary-accent shrink-0" />
            )}
            {isInlineContactVisible && (
              <span
                className={
                  isCompletedStyleVisible
                    ? "line-through text-secondary-icon"
                    : "text-secondary-text"
                }
              >
                {task.contact?.name}
              </span>
            )}
          </p>
        )}
      </div>

      <div
        className={`flex items-center gap-6 shrink-0 ${isCompletedStyleVisible ? "opacity-40" : ""}`}
      >
        <PriorityIcon
          icon={getPriorityConfig(task.priority).icon}
          bgColor={getPriorityConfig(task.priority).bgColor}
        />

        <Avatar
          id={`task-owner-${task.id}`}
          size="xs"
          src={task.owner.authPic ?? undefined}
          firstName={task.owner.firstName}
          lastName={task.owner.lastName ?? undefined}
        />
      </div>
    </div>
  );
};

export default TaskRow;
