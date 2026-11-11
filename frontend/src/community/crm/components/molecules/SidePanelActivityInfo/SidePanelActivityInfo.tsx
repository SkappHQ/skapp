import { DateTime } from "luxon";
import { FC, ReactNode } from "react";

import {
  SHORT_MONTH_YEAR_FORMAT,
  TIME_FORMAT_12_HOUR,
  TIME_FORMAT_24_HOUR
} from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatDayWithOrdinalIndicator } from "~community/common/utils/dateTimeUtils";
import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelCompanyField from "~community/crm/components/molecules/SidePanelCompanyField/SidePanelCompanyField";
import SidePanelDateField from "~community/crm/components/molecules/SidePanelDateField/SidePanelDateField";
import SidePanelLinkButton from "~community/crm/components/molecules/SidePanelLinkButton/SidePanelLinkButton";
import SidePanelTimeField from "~community/crm/components/molecules/SidePanelTimeField/SidePanelTimeField";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  id?: string;
  primaryRow?: ReactNode;
  date: DateTime;
  dateLabel: string;
  startTime?: DateTime;
  startTimeLabel?: string;
  hideStartTime?: boolean;
  secondaryRow?: ReactNode;
  owner?: CrmOwnerEntity;
  companyId?: number | null;
  companyName?: string;
  onCompanyClick: (companyId: number) => void;
  onDateChange?: (date: Date) => void;
  onStartTimeChange?: (time: string) => void;
  onOwnerChange?: (ownerId: number) => void;
  onCompanyChange?: (companyId: number) => void;
}

const SidePanelActivityInfo: FC<Props> = ({
  id,
  primaryRow,
  date,
  dateLabel,
  startTime,
  startTimeLabel,
  hideStartTime,
  secondaryRow,
  owner,
  companyId,
  companyName,
  onCompanyClick,
  onDateChange,
  onStartTimeChange,
  onOwnerChange,
  onCompanyChange
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "activitySidePanel",
    "info"
  );
  const translatePlaceholder = useTranslator("crmModule", "deals", "common");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  const noValue = translateText(["noValue"]);
  const resolvedStartTimeLabel = startTimeLabel
    ? startTimeLabel
    : translateText(["startTime"]);

  const handleOwnerChange = (user: CrmOwnerEntity | null): void => {
    if (onOwnerChange && user && user.employeeId !== owner?.employeeId) {
      onOwnerChange(user.employeeId);
    }
  };

  const renderOwner = (): ReactNode => {
    if (onOwnerChange) {
      return (
        <div className="flex flex-col w-full">
          <OwnerPopupSearch
            selectedUser={owner ? owner : null}
            onChange={handleOwnerChange}
            placeholder={noValue}
            searchPlaceholder={translatePlaceholder([
              "placeholders",
              "ownerSearch"
            ])}
            noResultsText={translatePlaceholder(["placeholders", "noResults"])}
          />
        </div>
      );
    }

    return owner ? (
      <OwnerAvatarChip id={String(owner.employeeId)} owner={owner} size="xs" />
    ) : (
      <span className="body2">{noValue}</span>
    );
  };

  const renderCompany = (): ReactNode => {
    if (onCompanyChange) {
      return (
        <SidePanelCompanyField
          id={`${id}-related-to`}
          companyId={companyId ?? null}
          emptyLabel={noValue}
          editAriaLabel={translateAria(["editRelatedTo"])}
          onCompanyClick={onCompanyClick}
          onChange={onCompanyChange}
        />
      );
    }

    return companyId && companyName ? (
      <SidePanelLinkButton
        label={companyName}
        onClick={() => onCompanyClick(companyId)}
      />
    ) : (
      <span className="body2">{noValue}</span>
    );
  };

  return (
    <div className="flex flex-col border border-secondary-accent rounded-xl p-3">
      {primaryRow}

      <PropertyRow label={dateLabel}>
        {onDateChange ? (
          <SidePanelDateField
            id={`${id}-date`}
            date={date}
            ariaLabel={translateAria(["editDate"])}
            onChange={onDateChange}
          />
        ) : (
          <span className="body2">
            {`${formatDayWithOrdinalIndicator(date)} ${date.toFormat(SHORT_MONTH_YEAR_FORMAT)}`}
          </span>
        )}
      </PropertyRow>

      {!hideStartTime && (
        <PropertyRow label={resolvedStartTimeLabel}>
          {onStartTimeChange ? (
            <SidePanelTimeField
              id={`${id}-start-time`}
              value={startTime ? startTime.toFormat(TIME_FORMAT_24_HOUR) : ""}
              placeholder={noValue}
              ariaLabel={translateAria(["editStartTime"])}
              onChange={onStartTimeChange}
            />
          ) : (
            <span className="body2">
              {startTime ? startTime.toFormat(TIME_FORMAT_12_HOUR) : noValue}
            </span>
          )}
        </PropertyRow>
      )}

      {secondaryRow}

      <PropertyRow label={translateText(["activityOwner"])}>
        {renderOwner()}
      </PropertyRow>

      <PropertyRow label={translateText(["relatedTo"])}>
        {renderCompany()}
      </PropertyRow>
    </div>
  );
};

export default SidePanelActivityInfo;
