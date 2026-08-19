import { ButtonV2, Label } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getPriorityConfig } from "~community/crm/v2/utils/crmTaskUtils";

interface Props {
  task: CrmTaskEntity;
  onMarkAsDone: () => void;
}

const SidePanelTaskInfo: FC<Props> = ({ task, onMarkAsDone }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");


  const { owner, contact } = useCrmStoreV2((state) => ({
    owner: state.owners[task.ownerId],
    contact: state.contacts[task.contactId]
  }));



  const priorityConfig = getPriorityConfig(task.priority);

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
          {owner && (
            <OwnerAvatarChip
              id={String(owner.employeeId)}
              owner={owner}
              size="xs"
            />
          )}
        </PropertyRow>

        {priorityConfig && (
          <PropertyRow label={translateText(["priority"])}>
            <Label
              backgroundColor={priorityConfig.bgColor}
              textColor={priorityConfig.textColor}
            >
              <span className="flex items-center gap-1">
                {priorityConfig.icon}
                {task.priority &&
                  translateText([
                    "priorityOptions",
                    task.priority.toLowerCase()
                  ])}
              </span>
            </Label>
          </PropertyRow>
        )}

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
