import { DateTime } from "luxon";
import { FC } from "react";

import {
  SHORT_MONTH_YEAR_FORMAT,
  TIME_FORMAT_12_HOUR
} from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatDayWithOrdinalIndicator } from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelEmailRecipients from "~community/crm/components/molecules/SidePanelEmailRecipients/SidePanelEmailRecipients";
import SidePanelLinkButton from "~community/crm/components/molecules/SidePanelLinkButton/SidePanelLinkButton";
import {
  CrmActivityEmailEntity,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";

interface Props {
  email: CrmActivityEmailEntity;
  owner?: CrmOwnerEntity;
  onCompanyClick: () => void;
}

const SidePanelActivityEmailInfo: FC<Props> = ({
  email,
  owner,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "emailSidePanel"
  );

  const noValue = translateText(["activitySidePanel", "info", "noValue"]);
  const loggedAt = DateTime.fromISO(email.loggedAt);

  return (
    <div className="flex flex-col gap-4">
      <SidePanelEmailRecipients
        id="activity-email-to"
        title={translateText(["emailSidePanel", "info", "to"])}
        ariaLabel={translateAria(["to"])}
        recipients={email.to}
      />
      {email.cc.length > 0 && (
        <SidePanelEmailRecipients
          id="activity-email-cc"
          title={translateText(["emailSidePanel", "info", "cc"])}
          ariaLabel={translateAria(["cc"])}
          recipients={email.cc}
        />
      )}
      {email.bcc.length > 0 && (
        <SidePanelEmailRecipients
          id="activity-email-bcc"
          title={translateText(["emailSidePanel", "info", "bcc"])}
          ariaLabel={translateAria(["bcc"])}
          recipients={email.bcc}
        />
      )}

      <div className="flex flex-col border border-secondary-accent rounded-xl p-3">
        <PropertyRow label={translateText(["emailSidePanel", "info", "from"])}>
          <span className="body2 break-all">
            {email.fromAddress ? email.fromAddress : noValue}
          </span>
        </PropertyRow>

        <PropertyRow
          label={translateText(["activitySidePanel", "info", "date"])}
        >
          <span className="body2">
            {`${formatDayWithOrdinalIndicator(loggedAt)} ${loggedAt.toFormat(SHORT_MONTH_YEAR_FORMAT)}`}
          </span>
        </PropertyRow>

        <PropertyRow label={translateText(["emailSidePanel", "info", "time"])}>
          <span className="body2">
            {loggedAt.toFormat(TIME_FORMAT_12_HOUR)}
          </span>
        </PropertyRow>

        <PropertyRow
          label={translateText(["activitySidePanel", "info", "activityOwner"])}
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
          label={translateText(["activitySidePanel", "info", "relatedTo"])}
        >
          {email.company?.name ? (
            <SidePanelLinkButton
              label={email.company.name}
              onClick={onCompanyClick}
            />
          ) : (
            <span className="body2">{noValue}</span>
          )}
        </PropertyRow>
      </div>
    </div>
  );
};

export default SidePanelActivityEmailInfo;
