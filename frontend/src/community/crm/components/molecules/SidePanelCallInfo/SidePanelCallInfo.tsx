import { FC } from "react";

import {
  SHORT_MONTH_YEAR_FORMAT,
  TIME_FORMAT_12_HOUR
} from "~community/common/constants/timeConstants";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  formatDayWithOrdinalIndicator,
  instantInZone
} from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelLinkButton from "~community/crm/components/molecules/SidePanelLinkButton/SidePanelLinkButton";
import {
  CrmCallEntity,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
import { formatCallDuration } from "~community/crm/utils/callUtil";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";

interface Props {
  call: CrmCallEntity;
  owner?: CrmOwnerEntity;
  onContactClick: () => void;
  onCompanyClick: () => void;
}

const SidePanelCallInfo: FC<Props> = ({
  call,
  owner,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule");
  const displayZone = useDisplayZone();

  const noValue = translateText([
    "activities",
    "callSidePanel",
    "info",
    "noValue"
  ]);
  const loggedAt = instantInZone(call.loggedAt, displayZone);
  const callDate = `${formatDayWithOrdinalIndicator(loggedAt)} ${loggedAt.toFormat(SHORT_MONTH_YEAR_FORMAT)}`;
  const callStartTime = loggedAt.toFormat(TIME_FORMAT_12_HOUR);

  return (
    <div className="flex flex-col border border-secondary-accent rounded-xl p-3">
      <PropertyRow
        label={translateText([
          "activities",
          "callSidePanel",
          "info",
          "contact"
        ])}
      >
        <SidePanelLinkButton
          label={getContactDisplayName(call.contact)}
          onClick={onContactClick}
        />
      </PropertyRow>

      <PropertyRow
        label={translateText(["activities", "callSidePanel", "info", "date"])}
      >
        <span className="body2">{callDate}</span>
      </PropertyRow>

      <PropertyRow
        label={translateText([
          "activities",
          "callSidePanel",
          "info",
          "startTime"
        ])}
      >
        <span className="body2">{callStartTime}</span>
      </PropertyRow>

      <PropertyRow
        label={translateText([
          "activities",
          "callSidePanel",
          "info",
          "duration"
        ])}
      >
        <span className="body2">
          {call.durationMinutes != null
            ? formatCallDuration(call.durationMinutes)
            : noValue}
        </span>
      </PropertyRow>

      <PropertyRow
        label={translateText([
          "activities",
          "callSidePanel",
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
          "callSidePanel",
          "info",
          "relatedTo"
        ])}
      >
        {call.company?.name ? (
          <SidePanelLinkButton
            label={call.company.name}
            onClick={onCompanyClick}
          />
        ) : (
          <span className="body2">{noValue}</span>
        )}
      </PropertyRow>
    </div>
  );
};

export default SidePanelCallInfo;
