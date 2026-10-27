import { DateTime } from "luxon";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatDayWithOrdinalIndicator } from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import {
  CrmCallEntity,
  CrmCompanyEntity,
  CrmContactEntity,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";

interface Props {
  call: CrmCallEntity;
  owner?: CrmOwnerEntity | null;
  contact?: CrmContactEntity | null;
  company?: CrmCompanyEntity | null;
  onContactClick?: () => void;
  onCompanyClick?: () => void;
}

const SidePanelCallInfo: FC<Props> = ({
  call,
  owner,
  contact,
  company,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const noValue = translateText([
    "activities",
    "callSidePanel",
    "info",
    "noValue"
  ]);
  const contactName = contact ? getContactDisplayName(contact) : "";
  const startAt = call.startAt ? DateTime.fromISO(call.startAt) : null;
  const callDate = startAt?.isValid
    ? `${formatDayWithOrdinalIndicator(startAt)} ${startAt.toFormat("MMMM")}`
    : "";
  const callStartTime = startAt?.isValid ? startAt.toFormat("hh:mm a") : "";

  const renderLink = (
    label: string,
    ariaLabel: string,
    onClick?: () => void
  ) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-[4px] bg-transparent border-0 p-0 cursor-pointer transition-opacity hover:opacity-80"
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
        {contactName ? (
          renderLink(
            contactName,
            translateAria(["activities", "callSidePanel", "openContact"]),
            onContactClick
          )
        ) : (
          <span className="body2">{noValue}</span>
        )}
      </PropertyRow>

      <PropertyRow
        label={translateText(["activities", "callSidePanel", "info", "date"])}
      >
        <span className="body2">{callDate || noValue}</span>
      </PropertyRow>

      <PropertyRow
        label={translateText([
          "activities",
          "callSidePanel",
          "info",
          "startTime"
        ])}
      >
        <span className="body2">{callStartTime || noValue}</span>
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
        {company?.name ? (
          renderLink(
            company.name,
            translateAria(["activities", "callSidePanel", "openCompany"]),
            onCompanyClick
          )
        ) : (
          <span className="body2">{noValue}</span>
        )}
      </PropertyRow>
    </div>
  );
};

export default SidePanelCallInfo;
