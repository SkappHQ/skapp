import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetDealById } from "~community/crm/v2/api/DealApi";
import SidePanelDealCard from "~community/crm/v2/components/molecules/SidePanelDealCard/SidePanelDealCard";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { mergeDeals } from "~community/crm/v2/utils/dealUtil";

interface Props {
  dealId?: number;
  emptyDescription?: string;
}

const SidePanelDealSection: FC<Props> = ({ dealId, emptyDescription }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const { deals, setDeals } = useCrmStoreV2(
    useShallow((store) => ({
      deals: store.deals,
      setDeals: store.setDeals
    }))
  );

  const { data: dealDetail } = useGetDealById(dealId ?? 0, dealId != null);

  useEffect(() => {
    if (!dealDetail) return;

    setDeals(mergeDeals(deals, [dealDetail]));
  }, [dealDetail]);

  if (dealId == null) {
    return (
      <EmptyDataView
        icon={<SearchIcon width="24" height="24" />}
        title={translateText(["emptyTitle"])}
        description={emptyDescription ?? translateText(["emptyDescription"])}
        className={{
          wrapper: "h-[14.25rem] bg-secondary-background rounded-lg"
        }}
      />
    );
  }

  return <SidePanelDealCard dealId={dealId} />;
};

export default SidePanelDealSection;
