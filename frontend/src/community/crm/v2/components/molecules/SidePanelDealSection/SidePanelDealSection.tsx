import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelDealCard from "~community/crm/v2/components/molecules/SidePanelDealCard/SidePanelDealCard";

interface Props {
  dealId?: number;
  emptyDescription: string;
}

const SidePanelDealSection: FC<Props> = ({ dealId, emptyDescription }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  if (dealId == null) {
    return (
      <EmptyDataView
        icon={<SearchIcon width="24" height="24" />}
        title={translateText(["emptyTitle"])}
        description={emptyDescription}
        className={{
          wrapper: "h-[14.25rem] bg-secondary-background rounded-lg"
        }}
      />
    );
  }

  return <SidePanelDealCard dealId={dealId} />;
};

export default SidePanelDealSection;
