import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelDealCard from "~community/crm/v2/components/molecules/SidePanelDealCard/SidePanelDealCard";
import {
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity
} from "~community/crm/v2/types/CrmCommonTypes";

interface Props {
  deal?: CrmDealEntity;
  owner?: CrmOwnerEntity;
  stage?: CrmStageEntity;
  emptyDescription?: string;
}

const SidePanelDealSection: FC<Props> = ({
  deal,
  owner,
  stage,
  emptyDescription
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  if (!deal) {
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

  return <SidePanelDealCard deal={deal} owner={owner} stage={stage} />;
};

export default SidePanelDealSection;
