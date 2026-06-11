import React from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealType } from "~community/crm/types/CommonTypes";

interface Props {
  deal: CrmDealType;
}

const DealAccordionItemContent: React.FC<Props> = ({ deal }) => {
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

export default DealAccordionItemContent;
