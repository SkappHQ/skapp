import { ButtonV2, EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";

interface Props {
  dealId: number | null;
  emptyDescription: string;
  onAddDeal: () => void;
  onDealChange: (dealId: number | null) => void;
}

const SidePanelActivityDeal: FC<Props> = ({
  dealId,
  emptyDescription,
  onAddDeal,
  onDealChange
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  if (dealId) {
    return (
      <div className="flex flex-col gap-2">
        <SidePanelDealSection
          dealIds={[dealId]}
          showAddDealAction={false}
          emptyHeightClassName="h-[163px]"
          emptyDescription={emptyDescription}
        />
        <div className="flex justify-end">
          <ButtonV2
            variant="tertiary"
            size="sm"
            aria-label={translateAria(["removeDeal"])}
            onClick={() => onDealChange(null)}
          >
            {translateText([
              "activities",
              "activitySidePanel",
              "buttons",
              "removeDeal"
            ])}
          </ButtonV2>
        </div>
      </div>
    );
  }

  return (
    <EmptyDataView
      icon={<SearchIcon />}
      title={translateText(["deals", "linkedSection", "emptyTitle"])}
      description={emptyDescription}
      button={{
        children: translateText(["deals", "common", "buttons", "addDeal"]),
        variant: "tertiary",
        "aria-label": translateAria(["addDeal"]),
        onClick: onAddDeal
      }}
      className={{
        wrapper: "h-[163px] bg-secondary-background rounded-lg"
      }}
    />
  );
};

export default SidePanelActivityDeal;
