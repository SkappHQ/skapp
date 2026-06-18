import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  AvatarChip,
  Label
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import {
  getPriorityConfig,
  getTaskTypeIcon
} from "~community/crm/utils/taskHelpers";

interface Props {
  tasks: CrmTaskType[];
  currentTaskId: number;
}

const SidePanelRelatedTasksSection: FC<Props> = ({ tasks, currentTaskId }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const relatedTasks = tasks.filter((t) => t.id !== currentTaskId);

  const isOverdue = (dueAt: string | null): boolean => {
    if (!dueAt) return false;
    return new Date(dueAt) < new Date();
  };

  const accordionItems: AdvancedAccordionItem[] = relatedTasks.map((task) => ({
    id: String(task.id),
    header: (
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center justify-center rounded-full size-6 shrink-0 ${
            task.isCompleted
              ? "bg-semantic-green-background"
              : "border-2 border-secondary-accent"
          }`}
        >
          {task.isCompleted && (
            <span className="text-semantic-green-text text-xs">✓</span>
          )}
        </span>
        {getTaskTypeIcon(task.type?.name ?? "Other", "sm")}
        <div className="flex flex-col">
          <span
            className={`body3 ${task.isCompleted ? "line-through text-secondary-text" : "text-primary-text"}`}
          >
            {task.name}
          </span>
          <span
            className={`body4 ${
              !task.isCompleted && isOverdue(task.dueAt)
                ? "text-semantic-red-text"
                : "text-secondary-text"
            } ${task.isCompleted ? "line-through" : ""}`}
          >
            {!task.isCompleted && isOverdue(task.dueAt)
              ? translateText(["overdue"])
              : task.dueAt
                ? translateText(["dueOn"], {
                    date: formatDateWithOrdinalSuffix(task.dueAt)
                  })
                : ""}
          </span>
        </div>
      </div>
    ),
    badge: (
      <div className="flex items-center gap-6">
        <Label
          backgroundColor={getPriorityConfig(task.priority).backgroundColor}
          textColor={getPriorityConfig(task.priority).textColor}
        >
          <span className="sr-only">{task.priority}</span>
        </Label>
        {task.owner && (
          <AvatarChip
            avatarProps={{
              firstName: task.owner.firstName,
              lastName: task.owner.lastName ?? "",
              src: task.owner.authPic ?? ""
            }}
            label={`${task.owner.firstName}${task.owner.lastName ? ` ${task.owner.lastName}` : ""}`}
            backgroundColor="bg-transparent"
          />
        )}
      </div>
    ),
    content: task.notes ? (
      <p className="body3 text-secondary-text">{task.notes}</p>
    ) : undefined
  }));

  return (
    <div className="flex flex-col gap-3">
      <h2 className="h2">{translateText(["relatedTasksTitle"])}</h2>
      <hr className="border-secondary-accent" />
      {accordionItems.length > 0 ? (
        <AdvancedAccordion items={accordionItems} allowMultiple={true} />
      ) : (
        <p className="body3 text-secondary-text">
          {translateText(["noRelatedTasks"])}
        </p>
      )}
    </div>
  );
};

export default SidePanelRelatedTasksSection;
