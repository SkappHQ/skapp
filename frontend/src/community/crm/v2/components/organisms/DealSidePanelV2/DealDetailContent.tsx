import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import DealSidePanelSkeleton from "~community/crm/components/organisms/DealSidePanel/DealSidePanelSkeleton";
import { useEditDeal, useGetDealById } from "~community/crm/v2/api/DealApi";
import {
  useGetTasksInfinite,
  useUpdateTask
} from "~community/crm/v2/api/TaskApi";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { TASK_PAGE_SIZE } from "~community/crm/v2/constants/taskConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { ingestEditedDeal } from "~community/crm/v2/utils/boardUtil";
import { mergeDeals } from "~community/crm/v2/utils/dealUtil";
import { updateTaskRecord } from "~community/crm/v2/utils/taskUtil";

import DealDescriptionSection from "./DealDescriptionSection";
import DealPropertiesSidebar from "./DealPropertiesSidebar";
import DealTitleSection from "./DealTitleSection";

interface DealDetailContentProps {
  dealId: number;
}

const DealDetailContent: FC<DealDetailContentProps> = ({ dealId }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const translateTaskText = useTranslator("crmModule", "tasks");
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

  const { data: dealDetail, isFetchedAfterMount } = useGetDealById(
    dealId,
    true
  );

  useEffect(() => {
    if (dealDetail && isFetchedAfterMount) {
      setDeals(mergeDeals(deals, [dealDetail]));
    }
  }, [dealDetail, isFetchedAfterMount]);

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

  const {
    data: dealTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetTasksInfinite({ dealId, size: TASK_PAGE_SIZE }, true);

  const dealTasks = useMemo(
    () => dealTasksData?.pages.flatMap((page) => page.items) ?? [],
    [dealTasksData]
  );

  const { mutate: updateTaskCompletion } = useUpdateTask();

  const applyCompletion = (taskId: number, isCompleted: boolean) => {
    setTasks(updateTaskRecord(tasks, [{ id: taskId, isCompleted }]));
  };

  const handleToggleError = (taskId: number, wasCompleted: boolean) => {
    applyCompletion(taskId, wasCompleted);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateTaskText(["toggleErrorTitle"]),
      description: translateTaskText(["toggleErrorDescription"])
    });
  };

  const handleToggleComplete = (taskId: number, isCompleted: boolean) => {
    const wasCompleted = tasks[taskId]?.isCompleted === true;

    applyCompletion(taskId, isCompleted);

    updateTaskCompletion(
      { id: taskId, task: { isCompleted } },
      { onError: () => handleToggleError(taskId, wasCompleted) }
    );
  };

  if (!deal) {
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
              tasks={dealTasks}
              emptyTitle={translateText(["tasks", "emptyTitle"])}
              emptyDescription={translateText(["tasks", "emptyDescription"])}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onFetchNextPage={fetchNextPage}
              onToggleComplete={handleToggleComplete}
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
