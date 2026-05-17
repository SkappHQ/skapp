import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

export type TaskType = "call" | "email";
export type TaskPriority = "high" | "medium" | "low";

export interface CompanyTaskData {
  id: string;
  title: string;
  type: TaskType;
  dueDate: string;
  isOverdue: boolean;
  isCompleted: boolean;
  priority: TaskPriority;
  assigneeAvatarUrl?: string;
}

interface Props {
  task: CompanyTaskData;
  onToggleComplete: (id: string) => void;
}

const typeIconMap: Record<TaskType, { bg: string; iconName: IconName }> = {
  call: { bg: "bg-teal-500", iconName: IconName.PHONE_ICON },
  email: { bg: "bg-purple-500", iconName: IconName.EMAIL_ICON }
};

const priorityStyleMap: Record<
  TaskPriority,
  { bg: string; fill: string }
> = {
  high: { bg: "bg-red-100", fill: "#dc2626" },
  medium: { bg: "bg-orange-100", fill: "#ea580c" },
  low: { bg: "bg-blue-100", fill: "#2563eb" }
};

const CompanyTask: React.FC<Props> = ({ task, onToggleComplete }) => {
  const { bg, iconName } = typeIconMap[task.type];
  const { bg: priorityBg, fill: priorityFill } = priorityStyleMap[task.priority];

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggleComplete(task.id)}
        className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 cursor-pointer ${
          task.isCompleted
            ? "bg-green-600 border-green-600"
            : "bg-white border-zinc-300"
        }`}
      >
        {task.isCompleted && (
          <Icon
            name={IconName.CHECK_ICON}
            width="14px"
            height="14px"
            fill="white"
          />
        )}
      </button>

      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${bg}`}
      >
        <Icon name={iconName} width="20px" height="20px" fill="white" />
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span
          className={`text-sm font-semibold text-zinc-900 truncate ${
            task.isCompleted ? "line-through" : ""
          }`}
        >
          {task.title}
        </span>
        <span
          className={`text-xs truncate ${
            task.isCompleted
              ? "text-zinc-400 line-through"
              : task.isOverdue
                ? "text-red-600"
                : "text-zinc-500"
          }`}
        >
          {task.isOverdue ? "Overdue" : task.dueDate}
        </span>
      </div>

      <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${priorityBg}`}>
        <Icon
          name={IconName.UP_ARROW_ICON}
          width="16px"
          height="16px"
          fill={priorityFill}
        />
      </div>

      {task.assigneeAvatarUrl ? (
        <img
          src={task.assigneeAvatarUrl}
          alt="Assignee"
          className="w-6 h-6 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-zinc-200 shrink-0" />
      )}
    </div>
  );
};

export default CompanyTask;
