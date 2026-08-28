import { ButtonV2, Label } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PropertyRow from "~community/crm/v2/components/molecules/PropertyRow/PropertyRow";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";

interface Props {
  taskId: number;
  onMarkAsDone: () => void;
}

const SidePanelTaskInfo: FC<Props> = ({ taskId, onMarkAsDone }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const { tasks, owners, contacts } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      owners: store.owners,
      contacts: store.contacts
    }))
  );

  const task = tasks[taskId];
  const owner = task.ownerId ? owners[task.ownerId] : undefined;
  const contact = task.contactId ? contacts[task.contactId] : undefined;

  const priorityConfig = getPriorityConfig(task.priority);
  const isCompleted = task.isCompleted === true;

  return (
    <>
      <ButtonV2
        type="button"
        variant="primary"
        size="md"
        onClick={onMarkAsDone}
        disabled={isCompleted}
        icon={
          isCompleted ? (
            <Icon
              name={IconName.TICK_ICON}
              fill="var(--color-secondary-icon)"
              width="16"
              height="16"
            />
          ) : undefined
        }
      >
        {isCompleted
          ? translateText(["statusDone"])
          : translateText(["markAsDone"])}
      </ButtonV2>

      <div className="flex flex-col border border-secondary-accent rounded-xl p-3 mt-4">
        <PropertyRow label={translateText(["assignedTo"])}>
          {owner ? (
            <OwnerAvatarChip
              id={String(owner.employeeId)}
              owner={owner}
              size="xs"
            />
          ) : (
            <span className="body2">{translateText(["noOwner"])}</span>
          )}
        </PropertyRow>

        <PropertyRow label={translateText(["priority"])}>
          <Label
            backgroundColor={priorityConfig.bgColor}
            textColor={priorityConfig.textColor}
          >
            <span className="flex items-center gap-1">
              {priorityConfig.icon}
              {translateText(["priorityOptions", priorityConfig.key])}
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
            {contact?.name ?? translateText(["noContact"])}
          </span>
        </PropertyRow>
      </div>
    </>
  );
};

export default SidePanelTaskInfo;
