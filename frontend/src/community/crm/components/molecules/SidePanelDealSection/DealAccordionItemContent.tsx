import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealEntity } from "~community/crm/types/CrmCommonTypes";
import { formatTableValue } from "~community/crm/utils/commonUtil";

interface DealAccordionItemContentProps {
  deal: CrmDealEntity;
}

const DealAccordionItemContent: FC<DealAccordionItemContentProps> = ({
  deal
}) => {
  const translateText = useTranslator("crmModule");

  return (
    <div className="flex flex-col gap-1">
      <p className="subtitle4 text-secondary-text">
        {translateText(["deals", "common", "labels", "description"])}
      </p>
      <p className="body3">{formatTableValue(deal.description)}</p>
    </div>
  );
};

export default DealAccordionItemContent;
