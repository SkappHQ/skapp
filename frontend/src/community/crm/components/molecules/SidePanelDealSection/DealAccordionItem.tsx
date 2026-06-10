import { Chip } from "@rootcodelabs/skapp-ui";
import React from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealType } from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

interface Props {
  deal: CrmDealType;
}

export const DealAccordionItemHeader: React.FC<Props> = ({ deal }) => (
  <div className="flex flex-col gap-[2px]">
    <span className="body2">{deal.name}</span>
    <div className="flex items-center gap-2 text-secondary-text">
      <span className="body3">{deal.contact.name}</span>
      {deal.amount && (
        <>
          <span className="inline-block h-1 w-1 rounded-full bg-secondary-icon" />
          <span className="body3">{formatValue(deal.amount)}</span>
        </>
      )}
    </div>
  </div>
);

export const DealAccordionItemBadge: React.FC<Props> = ({ deal }) => (
  <Chip
    label={deal.stage.name}
    size="sm"
    prefixIcon={
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: deal.stage.color }}
      />
    }
  />
);

export const DealAccordionItemContent: React.FC<Props> = ({ deal }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  return (
    <div className="flex flex-col gap-1">
      <p className="subtitle4 text-secondary-text">
        {translateText(["descriptionLabel"])}
      </p>
      {deal.description ? (
        <p className="body3">{deal.description}</p>
      ) : (
        <span className="body3">-</span>
      )}
    </div>
  );
};
