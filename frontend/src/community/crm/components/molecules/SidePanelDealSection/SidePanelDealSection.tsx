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
import {
  DetailPanelDealResponseType,
  PreselectedContact
} from "~community/crm/types/CommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import DealAccordionItemBadge from "./DealAccordionItemBadge";
import DealAccordionItemContent from "./DealAccordionItemContent";
import DealAccordionItemHeader from "./DealAccordionItemHeader";

interface Props {
  deals: DetailPanelDealResponseType[];
  preselectedContact?: PreselectedContact | null;
}

const SidePanelDealSection: FC<Props> = ({
  deals,
  preselectedContact
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const hasDeals = deals.length > 0;
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { pushCrmSidePanel, setPreselectedContact } = useCrmStore((store) => ({
    pushCrmSidePanel: store.pushCrmSidePanel,
    setPreselectedContact: store.setPreselectedContact
  }));

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () => {
      setPreselectedContact(preselectedContact ?? null);
      pushCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL);
    });
  };

  const accordionItems: AdvancedAccordionItem[] = deals.map((deal) => ({
    id: String(deal.id),
    header: <DealAccordionItemHeader deal={deal} />,
    badge: <DealAccordionItemBadge deal={deal} />,
    content: <DealAccordionItemContent deal={deal} />
  }));

  return (
    <div className="flex flex-col gap-4">
      {hasDeals ? (
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
