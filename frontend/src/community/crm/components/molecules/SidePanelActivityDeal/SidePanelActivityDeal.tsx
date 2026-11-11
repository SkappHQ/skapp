import { ButtonV2, EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddActivityDealModal from "~community/crm/components/molecules/AddActivityDealModal/AddActivityDealModal";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";

interface Props {
  id: string;
  dealId: number | null;
  emptyDescription: string;
  onDealChange: (dealId: number | null) => void;
}

const SidePanelActivityDeal: FC<Props> = ({
  id,
  dealId,
  emptyDescription,
  onDealChange
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);

  const handleSave = (selectedDealId: number | null): void => {
    setIsAddDealModalOpen(false);
    onDealChange(selectedDealId);
  };

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
    <>
      <EmptyDataView
        icon={<SearchIcon />}
        title={translateText(["deals", "linkedSection", "emptyTitle"])}
        description={emptyDescription}
        button={{
          children: translateText(["deals", "common", "buttons", "addDeal"]),
          variant: "tertiary",
          "aria-label": translateAria(["addDeal"]),
          onClick: () => setIsAddDealModalOpen(true)
        }}
        className={{
          wrapper: "h-[163px] bg-secondary-background rounded-lg"
        }}
      />
      {isAddDealModalOpen && (
        <AddActivityDealModal
          id={id}
          onSave={handleSave}
          onClose={() => setIsAddDealModalOpen(false)}
        />
      )}
    </>
  );
};

export default SidePanelActivityDeal;
