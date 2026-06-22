import { Avatar, ButtonV2, Label } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { getPriorityConfig } from "~community/crm/utils/taskHelpers";

interface Props {
  task: CrmTaskDetailType;
  onMarkAsDone?: () => void;
}

const SidePanelTaskInfo: FC<Props> = ({ task, onMarkAsDone }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const priorityConfig = getPriorityConfig(task.priority);
  const ownerLastName = task.owner?.lastName ? ` ${task.owner.lastName}` : "";

  const ownerName = task.owner
    ? `${task.owner.firstName}${ownerLastName}`
    : "";

  const infoRows: { label: string; value: ReactNode }[] = [
    {
      label: translateText(["assignedTo"]),
      value: task.owner ? (
        <div className="flex items-center gap-2">
          <Avatar
            id={`task-owner-${task.owner.employeeId}`}
            size="xs"
            firstName={task.owner.firstName}
            lastName={task.owner.lastName ?? ""}
            src={task.owner.authPic ?? ""}
          />
          <span className="body3">{ownerName}</span>
        </div>
      ) : (
        <span className="body3">—</span>
      )
    },
    {
      label: translateText(["priority"]),
      value: (
        <Label
          backgroundColor={priorityConfig.backgroundColor}
          textColor={priorityConfig.textColor}
        >
          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
        </Label>
      )
    },
    {
      label: translateText(["closingDate"]),
      value: (
        <span className="body3">
          {task.dueAt
            ? formatDateWithOrdinalSuffix(task.dueAt)
            : translateText(["noClosingDate"])}
        </span>
      )
    },
    {
      label: translateText(["contactName"]),
      value: task.contact ? (
        <button
          type="button"
          className="flex items-center gap-1 cursor-pointer text-primary-brand body3 hover:opacity-80"
        >
          <span>{task.contact.name}</span>
          <Icon
            name={IconName.POP_OUT_ICON}
            fill="var(--color-primary-brand)"
            width="14"
            height="14"
          />
        </button>
      ) : (
        <span className="body3 text-secondary-text">
          {translateText(["noContact"])}
        </span>
      )
    }
  ];


  return (
    <>
      <ButtonV2
        type="button"
        variant="primary"
        size="md"
        onClick={onMarkAsDone}
        disabled={task.isCompleted}
        icon={
          task.isCompleted ? (
            <Icon
              name={IconName.TICK_ICON}
              fill="var(--color-secondary-text)"
              width="16"
              height="16"
            />
          ) : undefined
        }
        iconPosition="end"
      >
        {task.isCompleted
          ? translateText(["statusDone"])
          : translateText(["markAsDone"])}
      </ButtonV2>

      <div className="w-[295px] min-h-[200px] flex flex-col gap-3 border border-secondary-accent rounded-xl p-3 mt-4">
        {infoRows.map((row) => (
          <div
            key={row.label}
            className="flex flex-1 items-center justify-between w-full"
          >
            <span className="subtitle3 text-secondary-text whitespace-nowrap">
              {row.label}
            </span>
            <div className="flex items-center">{row.value}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SidePanelTaskInfo;
