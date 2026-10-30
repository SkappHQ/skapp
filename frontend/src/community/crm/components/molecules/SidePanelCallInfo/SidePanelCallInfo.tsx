import { DateTime } from "luxon";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
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
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "callSidePanel",
    "info"
  );
  const translateActivityText = useTranslator(
    "crmModule",
    "activities",
    "activitySidePanel",
    "info"
  );
  const loggedAt = DateTime.fromISO(call.loggedAt);

  return (
    <SidePanelActivityInfo
      primaryRow={
        <PropertyRow label={translateText(["contact"])}>
          {call.contact ? (
            <SidePanelLinkButton
              label={getContactDisplayName(call.contact)}
              onClick={onContactClick}
            />
          ) : (
            <span className="body2">
              {translateActivityText(["noLongerAvailable"])}
            </span>
          )}
        </PropertyRow>
      }
      date={loggedAt}
      startTime={loggedAt}
      secondaryRow={
        <PropertyRow label={translateText(["duration"])}>
          <span className="body2">
            {call.durationMinutes != null
              ? formatCallDuration(call.durationMinutes)
              : translateActivityText(["noValue"])}
          </span>
        </PropertyRow>
      }
      owner={owner}
      companyName={call.company?.name}
      onCompanyClick={onCompanyClick}
    />
  );
};

export default SidePanelCallInfo;
