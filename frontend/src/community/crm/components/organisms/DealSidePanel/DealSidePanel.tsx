import {
  DeleteButtonIcon,
  KebabMenu,
  SidePanel
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetRelatedTasks } from "~community/crm/api/TaskApi";
import { useGetDealById } from "~community/crm/api/crmDealApi";
import { TASK_PAGE_SIZE } from "~community/crm/constants/taskConstants";
import DeleteDealModal from "~community/crm/components/molecules/DeleteDealModal/DeleteDealModal";
import DealSidePanelSkeleton from "./DealSidePanelSkeleton";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { useCrmStore } from "~community/crm/store/store";

import DealDescriptionSection from "./DealDescriptionSection";
import DealPropertiesSidebar from "./DealPropertiesSidebar";
import DealTitleSection from "./DealTitleSection";

const DealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const {
    isCrmSidePanelOpen,
    selectedDealId,
    setSelectedDealId,
    setIsCrmSidePanelOpen
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
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
        isOpen={isCrmSidePanelOpen}
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
              <DealPropertiesSidebar deal={deal!} isOpen={isCrmSidePanelOpen} />
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
