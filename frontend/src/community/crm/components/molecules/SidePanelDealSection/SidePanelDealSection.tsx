import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { DetailPanelDealResponseType } from "~community/crm/types/CommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import DealAccordionItemBadge from "./DealAccordionItemBadge";
import DealAccordionItemContent from "./DealAccordionItemContent";
import DealAccordionItemHeader from "./DealAccordionItemHeader";

interface Props {
  deals: DetailPanelDealResponseType[];
}

const SidePanelDealSection: FC<Props> = ({ deals }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { pushCrmSidePanel } = useCrmStore((store) => ({
    pushCrmSidePanel: store.pushCrmSidePanel
  }));

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () => {
      pushCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL);
    });
  };

  const accordionItems: AdvancedAccordionItem[] = deals?.map((deal) => ({
    id: String(deal.id),
    header: <DealAccordionItemHeader deal={deal} />,
    badge: <DealAccordionItemBadge deal={deal} />,
    content: <DealAccordionItemContent deal={deal} />
  }));

  return (
    <div className="flex flex-col gap-4">
      {deals?.length > 0 ? (
        <div className="flex flex-col w-full">
          <AdvancedAccordion
            items={accordionItems}
            allowMultiple={true}
            className="gap-4"
          />
          <div className="mt-2">
            <ButtonV2
              variant="line"
              size="sm"
              onClick={handleAddDeal}
              disabled={isCheckingCrmLimit}
              isLoading={isCheckingCrmLimit}
              aria-label={translateText(["ariaLabels", "addDealBtn"])}
              icon={<PlusIcon />}
              iconPosition="end"
            >
              {translateText(["addDealBtn"])}
            </ButtonV2>
          </div>
        </div>
      ) : (
        <EmptyDataView
          icon={<SearchIcon />}
          title={translateText(["emptyTitle"])}
          description={translateText(["emptyDescription"])}
          button={{
            children: translateText(["addDealBtn"]),
            variant: "tertiary",
            onClick: handleAddDeal,
            disabled: isCheckingCrmLimit,
            isLoading: isCheckingCrmLimit,
            icon: <PlusIcon />,
            "aria-label": translateText(["ariaLabels", "addDealBtn"])
          }}
          className={{
            wrapper: "h-[228px] bg-secondary-background rounded-lg"
          }}
        />
      )}
    </div>
  );
};

export default SidePanelDealSection;
