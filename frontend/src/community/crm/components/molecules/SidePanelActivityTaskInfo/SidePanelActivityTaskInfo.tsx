import { Label } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC } from "react";

import { SHORT_MONTH_YEAR_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatDayWithOrdinalIndicator } from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelLinkButton from "~community/crm/components/molecules/SidePanelLinkButton/SidePanelLinkButton";
import {
  CrmActivityTaskEntity,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";
import { getPriorityConfig } from "~community/crm/utils/priorityUtil";

interface Props {
  task: CrmActivityTaskEntity;
  owner?: CrmOwnerEntity;
  onContactClick: () => void;
  onCompanyClick: () => void;
}

const SidePanelActivityTaskInfo: FC<Props> = ({
  task,
  owner,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule");

  const noValue = translateText([
    "activities",
    "activitySidePanel",
    "info",
    "noValue"
  ]);
  const priorityConfig = getPriorityConfig(task.priority);
  const dueAt = DateTime.fromISO(task.dueAt);

  return (
    <div className="flex flex-col border border-secondary-accent rounded-xl p-3">
      <PropertyRow
        label={translateText(["tasks", "sidePanel", "info", "contactName"])}
      >
        {task.contact ? (
          <SidePanelLinkButton
            label={getContactDisplayName(task.contact)}
            onClick={onContactClick}
          />
        ) : (
          <span className="body2">{noValue}</span>
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
        label={translateText([
          "activities",
          "taskSidePanel",
          "info",
          "dueDate"
        ])}
      >
        <span className="body2">
          {`${formatDayWithOrdinalIndicator(dueAt)} ${dueAt.toFormat(SHORT_MONTH_YEAR_FORMAT)}`}
        </span>
      </PropertyRow>

      <PropertyRow
        label={translateText([
          "activities",
          "activitySidePanel",
          "info",
          "activityOwner"
        ])}
      >
        {owner ? (
          <OwnerAvatarChip
            id={String(owner.employeeId)}
            owner={owner}
            size="xs"
          />
        ) : (
          <span className="body2">{noValue}</span>
        )}
      </PropertyRow>

      <PropertyRow
        label={translateText([
          "activities",
          "activitySidePanel",
          "info",
          "relatedTo"
        ])}
      >
        {task.company?.name ? (
          <SidePanelLinkButton
            label={task.company.name}
            onClick={onCompanyClick}
          />
        ) : (
          <span className="body2">{noValue}</span>
        )}
      </PropertyRow>
    </div>
  );
};

export default SidePanelActivityTaskInfo;
