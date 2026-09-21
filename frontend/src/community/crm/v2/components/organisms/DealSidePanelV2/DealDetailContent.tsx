import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditDeal, useGetDealById } from "~community/crm/v2/api/DealApi";
import { useGetTasksInfinite } from "~community/crm/v2/api/TaskApi";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { TASK_PAGE_SIZE } from "~community/crm/v2/constants/taskConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmTaskFilterRequest } from "~community/crm/v2/types/CrmTypes";
import { ingestEditedDeal } from "~community/crm/v2/utils/boardUtil";
import { mergeDeals } from "~community/crm/v2/utils/dealUtil";
import { toTaskIds, updateTaskRecord } from "~community/crm/v2/utils/taskUtil";

import DealDescriptionSection from "./DealDescriptionSection";
import DealPropertiesSidebar from "./DealPropertiesSidebar";
import DealSidePanelSkeleton from "./DealSidePanelSkeleton";
import DealTitleSection from "./DealTitleSection";

interface DealDetailContentProps {
  dealId: number;
}

const DealDetailContent: FC<DealDetailContentProps> = ({ dealId }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const { setToastMessage } = useToast();

  const { deal, deals, board, tasks, setDeals, setBoardColumn, setTasks } =
    useCrmStoreV2(
      useShallow((store) => ({
        deal: store.deals[dealId],
        deals: store.deals,
        board: store.board,
        tasks: store.tasks,
        setDeals: store.setDeals,
        setBoardColumn: store.setBoardColumn,
        setTasks: store.setTasks
      }))
    );

  const taskFilters: CrmTaskFilterRequest = {
    dealId,
    size: TASK_PAGE_SIZE
  };

  const {
    data: dealDetail,
    isLoading: isDealLoading,
    isFetchedAfterMount
  } = useGetDealById(dealId, true);

  const {
    data: fetchedTasks,
    isLoading: isTasksLoading,
    fetchNextPage: fetchNextTasksPage,
    hasNextPage: hasNextTasksPage,
    isFetchingNextPage: isFetchingNextTasksPage
  } = useGetTasksInfinite(taskFilters);

  const dealTasks = useMemo(
    () => fetchedTasks?.pages.flatMap((page) => page?.items ?? []) ?? [],
    [fetchedTasks]
  );

  useEffect(() => {
    const dealFields: CrmDealEntity = { id: dealId };

    if (dealDetail && isFetchedAfterMount) {
      Object.assign(dealFields, dealDetail);
    }

    if (fetchedTasks) {
      setTasks(updateTaskRecord(tasks, dealTasks));
      dealFields.taskIds = toTaskIds(dealTasks);
    }

    setDeals(mergeDeals(deals, [dealFields]));
  }, [dealId, dealDetail, isFetchedAfterMount, fetchedTasks]);

  const handleSuccess = (updatedDeal: CrmDealEntity): void => {
    const next = ingestEditedDeal({ deals, board }, updatedDeal);
    setDeals(next.deals);
    setBoardColumn(next.board);
  };

  const handleError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "editErrorTitle"]),
      description: translateText(["toastMessages", "editErrorDescription"])
    });
  };

  const { mutate: editDeal } = useEditDeal(handleSuccess, handleError);

  const updateDeal = (fields: Partial<CrmDealEntity>): void => {
    editDeal({ ...fields, id: dealId });
  };

  if (isDealLoading || isTasksLoading || !deal) {
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
          {deal.description && (
            <DealDescriptionSection
              description={deal.description}
              onSave={(description) => updateDeal({ description })}
            />
          )}
          <div className="flex flex-col gap-3">
            <h2 className="h2">{translateText(["tasks", "title"])}</h2>
            <hr className="border-secondary-accent" />
            <SidePanelTasksSection
              taskIds={deal.taskIds}
              emptyDescription={translateText(["tasks", "emptyDescription"])}
              hasNextPage={hasNextTasksPage}
              isFetchingNextPage={isFetchingNextTasksPage}
              onFetchNextPage={fetchNextTasksPage}
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
