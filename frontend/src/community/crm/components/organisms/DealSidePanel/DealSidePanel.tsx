import {
  DeleteButtonIcon,
  KebabMenu,
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetRelatedTasks } from "~community/crm/api/TaskApi";
import { useGetDealById } from "~community/crm/api/crmDealApi";
import DeleteDealModal from "~community/crm/components/molecules/DeleteDealModal/DeleteDealModal";
import DealSidePanelSkeleton from "./DealSidePanelSkeleton";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { useCrmStore } from "~community/crm/store/store";

import DealDescriptionSection from "./DealDescriptionSection";
import DealPropertiesSidebar from "./DealPropertiesSidebar";
import DealTitleSection from "./DealTitleSection";

const DealSidePanel: FC<SidePanelProps> = ({ isOpen }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const { selectedDealId, setSelectedDealId, setIsCrmSidePanelOpen } =
    useCrmStore((store) => ({
      selectedDealId: store.selectedDealId,
      setSelectedDealId: store.setSelectedDealId,
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
    }));

  const handleClose = (): void => {
    setSelectedDealId(null);
    setIsCrmSidePanelOpen(false);
  };

  const { data: deal, isLoading } = useGetDealById(selectedDealId!);

  const {
    data: relatedTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetRelatedTasks({ dealId: selectedDealId });

  const relatedTasks =
    relatedTasksData?.pages.flatMap((page) => page.items ?? []) ?? [];

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage
  });

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
        {isLoading && !deal ? (
          <DealSidePanelSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            <DealTitleSection name={deal!.name} />
            <div className="flex gap-6 items-start">
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                <DealDescriptionSection description={deal!.description} />
                <div className="flex flex-col gap-3">
                  <h3 className="h2">{translateText(["tasks"])}</h3>
                  <hr className="border-secondary-accent" />
                  <SidePanelTasksSection tasks={relatedTasks} />
                  <div ref={loadingRef} />
                </div>
              </div>
              <DealPropertiesSidebar deal={deal!} />
            </div>
          </div>
        )}
      </SidePanel>

      <DeleteDealModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dealName={deal!.name ?? ""} 
      />
    </>
  );
};

export default DealSidePanel;
