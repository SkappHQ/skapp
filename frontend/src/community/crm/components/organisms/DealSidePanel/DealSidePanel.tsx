import { DeleteButtonIcon, KebabMenu, SidePanel } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetRelatedTasks } from "~community/crm/api/TaskApi";
import { useGetDealById } from "~community/crm/api/crmDealApi";
import DeleteDealModal from "~community/crm/components/molecules/DeleteDealModal/DeleteDealModal";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { TASK_PAGE_SIZE } from "~community/crm/constants/taskConstants";
import useDealDetailPanel from "~community/crm/hooks/useDealDetailPanel";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";

import DealDescriptionSection from "./DealDescriptionSection";
import DealPropertiesSidebar from "./DealPropertiesSidebar";
import DealSidePanelSkeleton from "./DealSidePanelSkeleton";
import DealTitleSection from "./DealTitleSection";

const DealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const { isCrmSidePanelOpen, crmSidePanelType, selectedDealId } = useCrmStore(
    (store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      selectedDealId: store.selectedDealId
    })
  );

  const { closeDealDetail } = useDealDetailPanel();

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL;

  const { data: deal, isLoading } = useGetDealById(selectedDealId!);

  const {
    data: relatedTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetRelatedTasks({ dealId: selectedDealId, size: TASK_PAGE_SIZE });

  const relatedTasks =
    relatedTasksData?.pages.flatMap((page) => page.items ?? []) ?? [];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

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
        onClose={closeDealDetail}
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
        }
      >
        {isLoading ? (
          <DealSidePanelSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            <DealTitleSection name={deal?.name ?? ""} />
            <div className="flex gap-6 items-start">
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                <DealDescriptionSection description={deal?.description ?? ""} />
                <div className="flex flex-col gap-3">
                  <h2 className="h2">{translateText(["tasks"])}</h2>
                  <hr className="border-secondary-accent" />
                  <SidePanelTasksSection
                    tasks={relatedTasks}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onFetchNextPage={fetchNextPage}
                  />
                </div>
              </div>
              <DealPropertiesSidebar deal={deal!} isOpen={isOpen} />
            </div>
          </div>
        )}
      </SidePanel>

      <DeleteDealModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dealName={deal?.name ?? ""}
      />
    </>
  );
};

export default DealSidePanel;
