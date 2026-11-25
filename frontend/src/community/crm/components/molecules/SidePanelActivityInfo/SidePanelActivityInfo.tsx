import { DateTime } from "luxon";
import { CSSProperties, FC, ReactNode, RefObject, useRef } from "react";

import {
  TIME_FORMAT_12_HOUR,
  TIME_FORMAT_24_HOUR
} from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelCompanyField from "~community/crm/components/molecules/SidePanelCompanyField/SidePanelCompanyField";
import SidePanelDateField from "~community/crm/components/molecules/SidePanelDateField/SidePanelDateField";
import SidePanelTimeField from "~community/crm/components/molecules/SidePanelTimeField/SidePanelTimeField";
import useCardAlignedPopup from "~community/crm/hooks/useCardAlignedPopup";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  id?: string;
  cardRef: RefObject<HTMLDivElement | null>;
  primaryRow?: ReactNode;
  date: DateTime;
  dateLabel: string;
  startTime?: DateTime;
  startTimeLabel?: string;
  hideStartTime?: boolean;
  secondaryRow?: ReactNode;
  owner?: CrmOwnerEntity;
  companyId: number | null;
  onCompanyClick: (companyId: number) => void;
  onDateChange: (date: Date) => void;
  onStartTimeChange?: (time: string) => void;
  onOwnerChange: (ownerId: number) => void;
  onCompanyChange: (companyId: number) => void;
}

const SidePanelActivityInfo: FC<Props> = ({
  id,
  cardRef,
  primaryRow,
  date,
  dateLabel,
  startTime,
  startTimeLabel,
  hideStartTime,
  secondaryRow,
  owner,
  companyId,
  onCompanyClick,
  onDateChange,
  onStartTimeChange,
  onOwnerChange,
  onCompanyChange
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );
  const ownerFieldRef = useRef<HTMLDivElement>(null);
  const ownerPopup = useCardAlignedPopup(cardRef, ownerFieldRef);

  const noValue = translateText([
    "activities",
    "activitySidePanel",
    "info",
    "noValue"
  ]);
  const resolvedStartTimeLabel =
    startTimeLabel ||
    translateText(["activities", "activitySidePanel", "info", "startTime"]);

  const handleOwnerChange = (user: CrmOwnerEntity | null): void => {
    if (user && user.employeeId !== owner?.employeeId) {
      onOwnerChange(user.employeeId);
    }
  };

  return (
    <div
      ref={cardRef}
      className="flex flex-col border border-secondary-accent rounded-xl p-3"
    >
      {primaryRow}

      <PropertyRow label={dateLabel}>
        <SidePanelDateField
          id={`${id}-date`}
          date={date}
          ariaLabel={translateAria(["editDate"])}
          onChange={onDateChange}
        />
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

      <PropertyRow
        label={translateText([
          "activities",
          "activitySidePanel",
          "info",
          "activityOwner"
        ])}
      >
        <div
          ref={ownerFieldRef}
          className="flex flex-col w-full"
          style={
            { "--card-popup-width": `${ownerPopup.width}px` } as CSSProperties
          }
        >
          <OwnerPopupSearch
            selectedUser={owner || null}
            onChange={handleOwnerChange}
            placeholder={noValue}
            popupWidth="w-[var(--card-popup-width)]"
            popupAlignment="right"
            popupOffset={{ x: ownerPopup.offsetX }}
            searchPlaceholder={translateText([
              "deals",
              "common",
              "placeholders",
              "ownerSearch"
            ])}
            noResultsText={translateText([
              "deals",
              "common",
              "placeholders",
              "noResults"
            ])}
          />
        </div>
      </PropertyRow>

      <PropertyRow
        label={translateText([
          "activities",
          "activitySidePanel",
          "info",
          "relatedTo"
        ])}
      >
        <SidePanelCompanyField
          id={`${id}-related-to`}
          cardRef={cardRef}
          companyId={companyId}
          emptyLabel={noValue}
          editAriaLabel={translateAria(["editRelatedTo"])}
          onCompanyClick={onCompanyClick}
          onChange={onCompanyChange}
        />
      </PropertyRow>
    </div>
  );
};

export default SidePanelActivityInfo;
