import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import RecordActivityActions from "~community/crm/activities/components/molecules/RecordActivityActions/RecordActivityActions";
import RecordActivitiesTab from "~community/crm/activities/components/organisms/RecordActivitiesTab/RecordActivitiesTab";
import { ActivityRecordType } from "~community/crm/activities/types/activityTypes";
import { useEditDeal, useGetDealById } from "~community/crm/api/DealApi";
import { useRecordActivityTab } from "~community/crm/hooks/useRecordActivityTab";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealEntity } from "~community/crm/types/CrmCommonTypes";
import { ingestEditedDeal } from "~community/crm/utils/boardUtil";
import { mergeDeals } from "~community/crm/utils/dealUtil";

import DealDescriptionSection from "./DealDescriptionSection";
import DealPropertiesSidebar from "./DealPropertiesSidebar";
import DealSidePanelSkeleton from "./DealSidePanelSkeleton";
import DealTitleSection from "./DealTitleSection";

interface DealDetailContentProps {
  dealId: number;
}

const DealDetailContent: FC<DealDetailContentProps> = ({ dealId }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  const [activityTab, setActivityTab] = useRecordActivityTab(dealId);

  const { deal, deals, board, setDeals, setBoardColumn } = useCrmStore(
    useShallow((store) => ({
      deal: store.deals[dealId],
      deals: store.deals,
      board: store.board,
      setDeals: store.setDeals,
      setBoardColumn: store.setBoardColumn
    }))
  );

  const {
    data: dealDetail,
    isLoading: isDealLoading,
    isFetchedAfterMount
  } = useGetDealById(dealId, true);

  useEffect(() => {
    const dealFields: CrmDealEntity = { id: dealId };

    if (dealDetail && isFetchedAfterMount) {
      Object.assign(dealFields, dealDetail);
    }

    setDeals(mergeDeals(deals, [dealFields]));
  }, [dealId, dealDetail, isFetchedAfterMount]);

  const handleSuccess = (updatedDeal: CrmDealEntity): void => {
    const next = ingestEditedDeal({ deals, board }, updatedDeal);
    setDeals(next.deals);
    setBoardColumn(next.board);
  };

  const handleError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "deals",
        "sidePanel",
        "toastMessages",
        "editErrorTitle"
      ]),
      description: translateText([
        "deals",
        "sidePanel",
        "toastMessages",
        "editErrorDescription"
      ])
    });
  };

  const { mutate: editDeal } = useEditDeal(handleSuccess, handleError);

  const updateDeal = (fields: Partial<CrmDealEntity>): void => {
    editDeal({ ...fields, id: dealId });
  };

  if (isDealLoading || !deal) {
    return <DealSidePanelSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {deal.name && (
        <DealTitleSection
          name={deal.name}
          onSave={(name) => updateDeal({ name })}
        />
      )}

      <div className="flex gap-6 items-start">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <DealDescriptionSection
            description={deal.description}
            onSave={(description) => updateDeal({ description })}
          />
          <div className="flex flex-col gap-3">
            <h2 className="h2">
              {translateText(["activities", "recordTab", "tabLabel"])}
            </h2>
            <hr className="border-secondary-accent" />
            <RecordActivitiesTab
              key={dealId}
              id="deal-activities"
              recordType={ActivityRecordType.DEAL}
              recordId={dealId}
              activeTab={activityTab}
              onTabChange={setActivityTab}
            />
            <RecordActivityActions
              id="deal-activity-actions"
              activeTab={activityTab}
              prefill={{
                contactId: deal?.contactId ? deal.contactId : null,
                dealId,
                companyId: deal?.companyId ? deal.companyId : null
              }}
              isLineButton
            />
          </div>
        </div>
        <DealPropertiesSidebar
          dealId={dealId}
          onStageChange={(stageId) => updateDeal({ stageId })}
          onAmountChange={(amount) => updateDeal({ amount })}
          onPriorityChange={(priority) => updateDeal({ priority })}
          onOwnerChange={(owner) => updateDeal({ ownerId: owner.employeeId })}
          onContactChange={(contact) => updateDeal({ contactId: contact.id })}
        />
      </div>
    </div>
  );
};

export default DealDetailContent;
