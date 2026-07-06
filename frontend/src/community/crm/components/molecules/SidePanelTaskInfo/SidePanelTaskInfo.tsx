import { AvatarChip, ButtonV2, Label } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { concatStrings } from "~community/common/utils/commonUtil";
import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { getPriorityConfig } from "~community/crm/utils/taskUtil";

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
      >
        {task.isCompleted
          ? translateText(["statusDone"])
          : translateText(["markAsDone"])}
      </ButtonV2>

      <div className="flex flex-col border border-secondary-accent rounded-xl p-3 mt-4">
        <PropertyRow label={translateText(["assignedTo"])}>
          <AvatarChip
            label={ownerName}
            avatarProps={{
              id: String(task.owner.employeeId),
              firstName: task.owner.firstName,
              lastName: task.owner.lastName ?? "",
              src: task.owner.authPic ?? "",
              size: "xs"
            }}
            showActionButton={false}
          />
        </PropertyRow>

        <PropertyRow label={translateText(["priority"])}>
          <Label
            backgroundColor={priorityConfig.bgColor}
            textColor={priorityConfig.textColor}
          >
            <span className="flex items-center gap-1">
              {priorityConfig.icon}
              {translateText(["priorityOptions", task.priority.toLowerCase()])}
            </span>
          </Label>
        </PropertyRow>

        <PropertyRow label={translateText(["closingDate"])}>
          <span className="body2">
            {task.dueAt
              ? formatDateWithOrdinalSuffix(task.dueAt)
              : translateText(["noClosingDate"])}
          </span>
        </PropertyRow>

        <PropertyRow label={translateText(["contactName"])}>
          <span className="body2">
            {task.contact?.name ?? translateText(["noContact"])}
          </span>
        </PropertyRow>
      </div>
    </>
  );
};

export default SidePanelTaskInfo;
