import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface DealAccordionItemContentProps {
  deal: CrmDealEntity;
}

const DealAccordionItemContent: FC<DealAccordionItemContentProps> = ({
  deal
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  return (
    <div className="flex flex-col gap-1">
      <p className="subtitle4 text-secondary-text">
        {translateText(["descriptionLabel"])}
      </p>
      {deal.description ? (
        <p className="body3">{deal.description}</p>
      ) : (
        <span className="body3">{"-"}</span>
      )}
    </div>
  );
};

export default DealAccordionItemContent;
