import { ButtonV2, Label } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PropertyRow from "~community/crm/v2/components/molecules/PropertyRow/PropertyRow";
import {
  CrmContactEntity,
  CrmOwnerEntity,
  CrmTaskEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";

interface Props {
  task: CrmTaskEntity;
  owner?: CrmOwnerEntity;
  contact?: CrmContactEntity;
  onMarkAsDone: () => void;
}

const SidePanelTaskInfo: FC<Props> = ({
  task,
  owner,
  contact,
  onMarkAsDone
}) => {
  const translateText = useTranslator("crmModuleV2");

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
          ? translateText(["tasks", "sidePanel", "info", "statusDone"])
          : translateText(["tasks", "sidePanel", "info", "markAsDone"])}
      </ButtonV2>

      <div className="flex flex-col border border-secondary-accent rounded-xl p-3 mt-4">
        <PropertyRow
          label={translateText(["tasks", "sidePanel", "info", "assignedTo"])}
        >
          {owner ? (
            <OwnerAvatarChip
              id={String(owner.employeeId)}
              owner={owner}
              size="xs"
            />
          ) : (
            <span className="body2">
              {translateText(["tasks", "sidePanel", "info", "noOwner"])}
            </span>
          )}
        </PropertyRow>

        <PropertyRow
          label={translateText(["tasks", "sidePanel", "info", "priority"])}
        >
          <Label
            backgroundColor={priorityConfig.bgColor}
            textColor={priorityConfig.textColor}
          >
            <span className="flex items-center gap-1">
              {priorityConfig.icon}
              {translateText(["common", "priorityOptions", priorityConfig.key])}
            </span>
          </Label>
        </PropertyRow>

        <PropertyRow
          label={translateText(["tasks", "sidePanel", "info", "closingDate"])}
        >
          <span className="body2">
            {task.dueAt
              ? formatDateWithOrdinalSuffix(task.dueAt)
              : translateText(["tasks", "sidePanel", "info", "noClosingDate"])}
          </span>
        </PropertyRow>

        <PropertyRow
          label={translateText(["tasks", "sidePanel", "info", "contactName"])}
        >
          <span className="body2">
            {getContactDisplayName(contact) ||
              translateText(["tasks", "sidePanel", "info", "noContact"])}
          </span>
        </PropertyRow>
      </div>
    </>
  );
};

export default SidePanelTaskInfo;
