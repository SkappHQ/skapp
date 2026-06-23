import { Avatar, ButtonV2, Label } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { concatStrings } from "~community/common/utils/commonUtil";
import {
  convertUTCStringToLocalDateTime,
  formatDateTimeWithOrdinalIndicator
} from "~community/common/utils/dateTimeUtils";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import {
  getPriorityConfig,
  getPriorityDisplayKey
} from "~community/crm/utils/taskUtil";

interface Props {
  task: CrmTaskDetailType;
  onMarkAsDone?: () => void;
}

const SidePanelTaskInfo: FC<Props> = ({ task, onMarkAsDone }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const priorityConfig = getPriorityConfig(task.priority);
  const ownerName = concatStrings([
    task.owner.firstName,
    task.owner.lastName ?? ""
  ]);

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
              fill="var(--color-secondary-icon)"
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

      <div className="w-[18.4375rem] min-h-[12.5rem] flex flex-col gap-3 border border-secondary-accent rounded-xl p-3 mt-4">
        <div className="flex flex-1 items-center justify-between w-full">
          <span className="subtitle3 text-secondary-text whitespace-nowrap">
            {translateText(["assignedTo"])}
          </span>
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <Avatar
                id={`task-owner-${task.owner.employeeId}`}
                size="xs"
                firstName={task.owner.firstName}
                lastName={task.owner.lastName ?? ""}
                src={task.owner.authPic ?? ""}
              />
              <span className="body2">{ownerName}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between w-full">
          <span className="subtitle3 text-secondary-text whitespace-nowrap">
            {translateText(["priority"])}
          </span>
          <div className="flex items-center">
            <Label
              backgroundColor={priorityConfig.bgColor}
              textColor={priorityConfig.textColor}
            >
              {translateText([
                "priorityOptions",
                getPriorityDisplayKey(task.priority)
              ])}
            </Label>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between w-full">
          <span className="subtitle3 text-secondary-text whitespace-nowrap">
            {translateText(["closingDate"])}
          </span>
          <div className="flex items-center">
            <span className="body3">
              {task.dueAt
                ? formatDateTimeWithOrdinalIndicator(
                    convertUTCStringToLocalDateTime(task.dueAt)
                  )
                : translateText(["none"])}
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between w-full">
          <span className="subtitle3 text-secondary-text whitespace-nowrap">
            {translateText(["contactName"])}
          </span>
          <div className="flex items-center">
            {task.contact ? (
              <span className="body2">{task.contact.name}</span>
            ) : (
              <span className="body2">{translateText(["none"])}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SidePanelTaskInfo;
