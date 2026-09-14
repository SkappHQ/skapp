import { DeleteButtonIcon, KebabMenu, SidePanel } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import DealSidePanelSkeleton from "~community/crm/components/organisms/DealSidePanel/DealSidePanelSkeleton";
import { useEditDeal, useGetDealById } from "~community/crm/v2/api/DealApi";
import { useGetTasksInfinite } from "~community/crm/v2/api/TaskApi";
import DeleteDealModalV2 from "~community/crm/v2/components/molecules/DeleteDealModalV2/DeleteDealModalV2";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { TASK_PAGE_SIZE } from "~community/crm/v2/constants/taskConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";
import { ingestEditedDeal } from "~community/crm/v2/utils/boardUtil";
import {
  getSelectedDeal,
  updateDealRecord
} from "~community/crm/v2/utils/dealUtil";
import { toTaskIds, updateTaskRecord } from "~community/crm/v2/utils/taskUtil";

import DealDescriptionSection from "./DealDescriptionSection";
import DealPropertiesSidebar from "./DealPropertiesSidebar";
import DealTitleSection from "./DealTitleSection";

const DealSidePanelV2: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const { isCrmSalesManager } = useSessionData();
  const { setToastMessage } = useToast();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedDealId,
    setSelectedDealId,
    closeCrmSidePanel,
    deals,
    board,
    tasks,
    setDeals,
    setTasks,
    setBoardColumn
  } = useCrmStoreV2(
    useShallow((state) => ({
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      selectedDealId: state.selectedDealId,
      setSelectedDealId: state.setSelectedDealId,
      closeCrmSidePanel: state.closeCrmSidePanel,
      deals: state.deals,
      board: state.board,
      tasks: state.tasks,
      setDeals: state.setDeals,
      setTasks: state.setTasks,
      setBoardColumn: state.setBoardColumn
    }))
  );

  const selectedDeal = getSelectedDeal(deals, selectedDealId);

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL;

  const handleClose = () => {
    setSelectedDealId(null);
    closeCrmSidePanel();
  };

  const { data: dealDetail } = useGetDealById(
    selectedDealId ?? 0,
    selectedDealId != null
  );

  useEffect(() => {
    if (dealDetail) {
      setDeals(updateDealRecord(deals, [dealDetail]));
    }
  }, [dealDetail]);

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
    if (selectedDealId == null) return;
    editDeal({ ...fields, id: selectedDealId });
  };

  const {
    data: fetchedTasks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetTasksInfinite({
    dealId: selectedDealId ?? undefined,
    size: TASK_PAGE_SIZE
  });

  const taskItems = fetchedTasks?.pages.flatMap((page) => page.items) ?? [];

  const taskIds = toTaskIds(taskItems);

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(updateTaskRecord(tasks, taskItems));
    }
  }, [fetchedTasks]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const menuItems = [
    {
      id: "delete",
      label: translateText(["deleteDeal"]),
      icon: {
        start: (
          <DeleteButtonIcon
            width="12px"
            height="14px"
            fill="var(--color-semantic-red-text)"
          />
        )
      },
      activeBehavior: "hover:bg-semantic-red-background text-semantic-red-text",
      onClick: () => setIsDeleteModalOpen(true)
    }
  ];

  return (
    <>
      <SidePanel
        isOpen={isOpen}
        onClose={handleClose}
        closeOnBackdropClick
        header={
          <div className="flex flex-col gap-3 pl-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-status-pink">
                <HandshakeIcon
                  width="14"
                  height="14"
                  fill="var(--color-white)"
                />
              </div>
              <span className="body1 text-secondary-icon">
                #{selectedDealId}
              </span>
            </div>
          </div>
        }
        headerActions={
          isCrmSalesManager && (
            <KebabMenu
              id="deal-actions"
              menuItems={menuItems}
              anchorButton={{
                "aria-label": translateText(["kebabMenuAriaLabel"])
              }}
              className={{
                anchorElement:
                  "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
              }}
            />
          )
        }
      >
        {!selectedDeal ? (
          <DealSidePanelSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            <DealTitleSection
              name={selectedDeal.name ?? ""}
              onSave={(name) => updateDeal({ name })}
            />
            <div className="flex gap-6 items-start">
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                <DealDescriptionSection
                  description={selectedDeal.description ?? ""}
                  onSave={(description) => updateDeal({ description })}
                />
                <div className="flex flex-col gap-3">
                  <h2 className="h2">{translateText(["tasks", "title"])}</h2>
                  <hr className="border-secondary-accent" />
                  <SidePanelTasksSection
                    taskIds={taskIds}
                    emptyDescription={translateText([
                      "tasks",
                      "emptyDescription"
                    ])}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onFetchNextPage={fetchNextPage}
                  />
                </div>
              </div>
              {selectedDealId != null && (
                <DealPropertiesSidebar
                  dealId={selectedDealId}
                  onStageChange={(stageId) => updateDeal({ stageId })}
                  onAmountChange={(amount) => updateDeal({ amount })}
                  onPriorityChange={(priority) => updateDeal({ priority })}
                  onOwnerChange={(owner) =>
                    updateDeal({ ownerId: owner.employeeId })
                  }
                  onContactChange={(contact) =>
                    updateDeal({ contactId: contact.id })
                  }
                />
              )}
            </div>
          </div>
        )}
      </SidePanel>

      <DeleteDealModalV2
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dealName={selectedDeal?.name ?? ""}
      />
    </>
  );
};

export default DealSidePanelV2;
