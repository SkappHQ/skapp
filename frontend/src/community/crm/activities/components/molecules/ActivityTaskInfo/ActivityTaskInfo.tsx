import { AvatarChip, ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  ActivityTaskDetail,
  ActivityTaskUpdate
} from "~community/crm/activities/types/activityTypes";
import { getLinkLabel } from "~community/crm/activities/utils/activityFeedUtil";
import { canMarkTaskAsDone } from "~community/crm/activities/utils/activityTaskUtil";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import { CrmPriorityEnum } from "~community/crm/enums/common";

import ActivityTaskDueDateField from "./ActivityTaskDueDateField";
import ActivityTaskPriorityField from "./ActivityTaskPriorityField";

interface ActivityTaskInfoProps {
  id: string;
  task: ActivityTaskDetail;
  isEditable: boolean;
  timeZone?: string;
  onUpdate: (fields: ActivityTaskUpdate) => void;
  onMarkAsDone: () => void;
}

const INFO_KEYS = ["activities", "taskPanel", "info"];

const ActivityTaskInfo: FC<ActivityTaskInfoProps> = ({
  id,
  task,
  isEditable,
  timeZone,
  onUpdate,
  onMarkAsDone
}) => {
  const translateText = useTranslator("crmModule");
  const [ownerImageUrl] = useGetImageUrl([task.owner?.avatar ?? ""]);

  const [ownerFirstName, ...ownerOtherNames] = (task.owner?.name ?? "")
    .trim()
    .split(/\s+/);

  return (
    <>
      <ButtonV2
        id={`${id}-mark-as-done`}
        type="button"
        variant="primary"
        size="md"
        onClick={onMarkAsDone}
        disabled={!canMarkTaskAsDone(task)}
        {...(task.isCompleted
          ? {
              icon: (
                <Icon
                  name={IconName.TICK_ICON}
                  fill="var(--color-secondary-icon)"
                  width="16"
                  height="16"
                />
              )
            }
          : {})}
      >
        {translateText([
          ...INFO_KEYS,
          task.isCompleted ? "statusDone" : "markAsDone"
        ])}
      </ButtonV2>

      <div className="flex flex-col border border-secondary-accent rounded-xl p-3 mt-4">
        <PropertyRow label={translateText([...INFO_KEYS, "assignedTo"])}>
          {task.owner ? (
            <AvatarChip
              avatarProps={{
                id: `${id}-owner`,
                firstName: ownerFirstName,
                lastName: ownerOtherNames.join(" "),
                size: "xs",
                ...(ownerImageUrl ? { src: ownerImageUrl } : {})
              }}
              label={task.owner.name}
            />
          ) : (
            <span className="body2">
              {translateText([...INFO_KEYS, "noOwner"])}
            </span>
          )}
        </PropertyRow>

        <PropertyRow label={translateText([...INFO_KEYS, "priority"])}>
          <ActivityTaskPriorityField
            id={`${id}-priority`}
            priority={task.priority ?? CrmPriorityEnum.LOW}
            isEditable={isEditable}
            onSave={(priority) => onUpdate({ priority })}
          />
        </PropertyRow>

        <PropertyRow label={translateText([...INFO_KEYS, "dueDate"])} required>
          <ActivityTaskDueDateField
            id={`${id}-due-date`}
            dueAt={task.dueAt}
            isEditable={isEditable}
            timeZone={timeZone}
            onSave={(dueAt) => onUpdate({ dueAt })}
          />
        </PropertyRow>

        <PropertyRow label={translateText([...INFO_KEYS, "contactName"])}>
          {task.contact ? (
            <span
              id={`${id}-contact`}
              className={`body2 truncate ${
                task.contact.deleted ? "text-secondary-icon" : ""
              }`}
              title={getLinkLabel(task.contact, translateText)}
            >
              {getLinkLabel(task.contact, translateText)}
            </span>
          ) : (
            <span className="body2">
              {translateText([...INFO_KEYS, "noContact"])}
            </span>
          )}
        </PropertyRow>
      </div>
    </>
  );
};

export default ActivityTaskInfo;
