import { Label } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
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

  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <SidePanelActivityInfo
      primaryRow={
        <>
          <PropertyRow
            label={translateText(["tasks", "sidePanel", "info", "contactName"])}
          >
            {task.contact ? (
              <SidePanelLinkButton
                label={getContactDisplayName(task.contact)}
                onClick={onContactClick}
              />
            ) : (
              <span className="body2">
                {translateText([
                  "activities",
                  "activitySidePanel",
                  "info",
                  "noValue"
                ])}
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
                {translateText([
                  "common",
                  "priorityOptions",
                  priorityConfig.key
                ])}
              </span>
            </Label>
          </PropertyRow>
        </>
      }
      date={DateTime.fromISO(task.dueAt)}
      dateLabel={translateText([
        "activities",
        "taskSidePanel",
        "info",
        "dueDate"
      ])}
      hideStartTime
      owner={owner}
      companyName={task.company?.name}
      onCompanyClick={onCompanyClick}
    />
  );
};

export default SidePanelActivityTaskInfo;
