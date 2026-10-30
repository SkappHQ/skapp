import { DateTime } from "luxon";
import { FC, ReactNode } from "react";

import {
  SHORT_MONTH_YEAR_FORMAT,
  TIME_FORMAT_12_HOUR
} from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatDayWithOrdinalIndicator } from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelLinkButton from "~community/crm/components/molecules/SidePanelLinkButton/SidePanelLinkButton";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  primaryRow?: ReactNode;
  date: DateTime;
  startTime?: DateTime;
  secondaryRow: ReactNode;
  owner?: CrmOwnerEntity;
  companyName?: string;
  onCompanyClick: () => void;
}

const SidePanelActivityInfo: FC<Props> = ({
  primaryRow,
  date,
  startTime,
  secondaryRow,
  owner,
  companyName,
  onCompanyClick
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "activitySidePanel",
    "info"
  );

  const noValue = translateText(["noValue"]);

  return (
    <div className="flex flex-col border border-secondary-accent rounded-xl p-3">
      {primaryRow}

      <PropertyRow label={translateText(["date"])}>
        <span className="body2">
          {`${formatDayWithOrdinalIndicator(date)} ${date.toFormat(SHORT_MONTH_YEAR_FORMAT)}`}
        </span>
      </PropertyRow>

      <PropertyRow label={translateText(["startTime"])}>
        <span className="body2">
          {startTime ? startTime.toFormat(TIME_FORMAT_12_HOUR) : noValue}
        </span>
      </PropertyRow>

      {secondaryRow}

      <PropertyRow label={translateText(["activityOwner"])}>
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

      <PropertyRow label={translateText(["relatedTo"])}>
        {companyName ? (
          <SidePanelLinkButton label={companyName} onClick={onCompanyClick} />
        ) : (
          <span className="body2">{noValue}</span>
        )}
      </PropertyRow>
    </div>
  );
};

export default SidePanelActivityInfo;
