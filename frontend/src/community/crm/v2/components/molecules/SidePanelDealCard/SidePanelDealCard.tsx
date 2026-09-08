import { FC } from "react";

import { concatStrings } from "~community/common/utils/commonUtil";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import {
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { formatCurrency } from "~community/crm/v2/utils/commonUtil";

interface Props {
  deal: CrmDealEntity;
  owner?: CrmOwnerEntity;
  stage?: CrmStageEntity;
}

const SidePanelDealCard: FC<Props> = ({ deal, owner, stage }) => {
  const { getStageByName } = useStageNameMapper();

  const ownerName = concatStrings([
    owner?.firstName ?? "",
    owner?.lastName ?? ""
  ]);

  return (
    <div className="border-secondary-accent flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3">
      <div className="flex flex-col gap-[2px] min-w-0">
        <span className="body2 truncate" title={deal.name ?? ""}>
          {deal.name}
        </span>
        <div className="flex items-center gap-2 text-secondary-text">
          {ownerName && <span className="body3">{ownerName}</span>}
          {ownerName && deal.amount && (
            <span className="inline-block h-1 w-1 rounded-full bg-secondary-icon" />
          )}
          {deal.amount && (
            <span className="body3">{formatCurrency(deal.amount)}</span>
          )}
        </div>
      </div>

      {stage && (
        <StageLabel
          label={getStageByName(stage.name ?? "")}
          color={stage.color}
        />
      )}
    </div>
  );
};

export default SidePanelDealCard;
