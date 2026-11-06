import { DateTime } from "luxon";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
import SidePanelEmailRecipients from "~community/crm/components/molecules/SidePanelEmailRecipients/SidePanelEmailRecipients";
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

      <SidePanelActivityInfo
        primaryRow={
          <PropertyRow
            label={translateText(["emailSidePanel", "info", "from"])}
          >
            <span className="body2 break-all">
              {email.fromAddress
                ? email.fromAddress
                : translateText(["activitySidePanel", "info", "noValue"])}
            </span>
          </PropertyRow>
        }
        date={loggedAt}
        dateLabel={translateText(["activitySidePanel", "info", "date"])}
        startTime={loggedAt}
        startTimeLabel={translateText(["emailSidePanel", "info", "time"])}
        owner={owner}
        companyName={email.company?.name}
        onCompanyClick={onCompanyClick}
      />
    </div>
  );
};

export default SidePanelActivityEmailInfo;
