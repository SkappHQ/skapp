import { Avatar, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import {
  formatDueDate,
  getPriorityConfig,
  getTaskTypeIcon
} from "~community/crm/utils/taskUtil";

interface Props {
  task: CrmTaskType;
  onRowClick?: () => void;
  className?: string;
}

const CompletedTaskRow: FC<Props> = ({ task, onRowClick, className }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const dueDateStatus = formatDueDate(task.dueAt, task.isCompleted);

  return (
    <div
      className={`relative flex items-center gap-4 p-3 min-w-0 ${className} min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden`}
    >
      <button
        type="button"
        className="flex-1 min-w-0 flex items-center gap-4 text-left border-0 bg-transparent p-0 cursor-pointer focus:outline-none"
        onClick={onRowClick}
      >
        <div className="shrink-0 flex items-center justify-center">
          {getTaskTypeIcon(task.type.name)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="body2 leading-snug truncate text-black">{task.name}</p>
          {dueDateStatus && (
            <p className="body3 leading-none mt-0.5 flex items-center gap-2">
              {dueDateStatus && (
                <span className={dueDateStatus.colorClass}>
                  {translateText([dueDateStatus.textKey], {
                    date: dueDateStatus.dateValue ?? ""
                  })}
                </span>
              )}
              {task.contact && (
                <>
                  <span className="w-1 h-1 rounded-full bg-secondary-accent shrink-0" />
                  <span className="text-secondary-text">
                    {task.contact.name}
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-6 shrink-0">
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
      </button>
    </div>
  );
};

export default CompletedTaskRow;
