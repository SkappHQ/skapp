import { DeleteButtonIcon, KebabMenu, SidePanel } from "@rootcodelabs/skapp-ui";
import type { InfiniteData } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetRelatedTasks } from "~community/crm/api/TaskApi";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import DealSidePanelSkeleton from "~community/crm/components/organisms/DealSidePanel/DealSidePanelSkeleton";
import { RelatedTasksPage } from "~community/crm/types/CommonTypes";
import { useEditDeal, useGetDealById } from "~community/crm/v2/api/DealApi";
import DeleteDealModalV2 from "~community/crm/v2/components/molecules/DeleteDealModalV2/DeleteDealModalV2";
import { TASK_PAGE_SIZE } from "~community/crm/v2/constants/taskConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";
import { ingestEditedDeal } from "~community/crm/v2/utils/boardUtil";
import { updateDealRecord } from "~community/crm/v2/utils/dealUtil";

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
    selectedDeal,
    setSelectedDealId,
    closeCrmSidePanel,
    deals,
    board,
    setDeals,
    setBoardColumn
  } = useCrmStoreV2(
    useShallow((store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      selectedDealId: store.selectedDealId,
      selectedDeal:
        store.selectedDealId != null
          ? store.deals[store.selectedDealId]
          : undefined,
      setSelectedDealId: store.setSelectedDealId,
      closeCrmSidePanel: store.closeCrmSidePanel,
      deals: store.deals,
      board: store.board,
      setDeals: store.setDeals,
      setBoardColumn: store.setBoardColumn
    }))
  );

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
      const store = useCrmStoreV2.getState();
      store.setDeals(updateDealRecord(store.deals, [dealDetail]));
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
    data: relatedTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetRelatedTasks({ dealId: selectedDealId, size: TASK_PAGE_SIZE });

  const relatedTasks =
    (
      relatedTasksData as unknown as InfiniteData<RelatedTasksPage> | undefined
    )?.pages.flatMap((page) => page.items) ?? [];

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
                    tasks={relatedTasks}
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
