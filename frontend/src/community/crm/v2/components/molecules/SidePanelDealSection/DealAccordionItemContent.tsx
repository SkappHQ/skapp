import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { formatTableValue } from "~community/crm/v2/utils/commonUtil";

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
      <p className="body3">{formatTableValue(deal.description)}</p>
    </div>
  );
};

export default DealAccordionItemContent;
