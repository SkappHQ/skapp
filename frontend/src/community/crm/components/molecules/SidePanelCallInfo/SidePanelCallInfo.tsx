import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import {
  SHORT_MONTH_YEAR_FORMAT,
  TIME_FORMAT_12_HOUR
} from "~community/common/constants/timeConstants";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  formatDayWithOrdinalIndicator,
  instantInZone
} from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import {
  CrmCallEntity,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
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

  const renderLink = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-[4px] min-w-0 max-w-full bg-transparent border-0 p-0 cursor-pointer transition-opacity hover:opacity-80"
    >
      <span className="body2 leading-6 tracking-[0.5px] underline text-primary-text truncate">
        {label}
      </span>
      <Icon
        name={IconName.POP_OUT_ICON}
        fill="var(--color-primary-text)"
        width="16"
        height="16"
      />
    </button>
  );

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
        {call.contact ? (
          renderLink(getContactDisplayName(call.contact), onContactClick)
        ) : (
          <span className="body2">
            {translateText([
              "activities",
              "callSidePanel",
              "info",
              "noLongerAvailable"
            ])}
          </span>
        )}
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
            ? translateText(
                ["activities", "callSidePanel", "info", "durationValue"],
                {
                  minutes: call.durationMinutes
                }
              )
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
          renderLink(call.company.name, onCompanyClick)
        ) : (
          <span className="body2">{noValue}</span>
        )}
      </PropertyRow>
    </div>
  );
};

export default SidePanelCallInfo;
