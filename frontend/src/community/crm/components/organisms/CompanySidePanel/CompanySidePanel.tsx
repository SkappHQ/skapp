import {
  DeleteButtonIcon,
  EditIcon,
  MenuItemProps,
  SidePanel,
  TabItem,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCompletedTasksByCompany,
  useGetContactsByCompany,
  useGetDealsByCompany,
  useGetOpenTasksByCompany
} from "~community/crm/api/CompanyApi";
import SidePanelCompanyContacts from "~community/crm/components/molecules/SidePanelCompanyContacts/SidePanelCompanyContacts";
import SidePanelCompanyHeader from "~community/crm/components/molecules/SidePanelCompanyHeader/SidePanelCompanyHeader";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelMetricCards from "~community/crm/components/molecules/SidePanelMetricCards/SidePanelMetricCards";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { TASK_PAGE_SIZE } from "~community/crm/constants/taskConstants";
import { SidePanelTabEnum } from "~community/crm/enums/TabTypesEnum";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { mapCompanyToMetricItems } from "~community/crm/utils/companyUtil";

import CompanySidePanelHeaderActions from "./CompanySidePanelHeaderActions";
import CompanySidePanelSkeleton from "./CompanySidePanelSkeleton";

const CompanySidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");
  const { isCrmSalesManager } = useSessionData();

  const [activeTab, setActiveTab] = useState<SidePanelTabEnum>(
    SidePanelTabEnum.TASKS
  );

  const {
    setIsCompanyModalOpen,
    setCompanyModalType,
    selectedCompanyId,
    getCompanyById,
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedCompanyId,
    closeCrmSidePanel,
    updateCompany
  } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen,
    setCompanyModalType: store.setCompanyModalType,
    selectedCompanyId: store.selectedCompanyId,
    getCompanyById: store.getCompanyById,
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    crmSidePanelType: store.crmSidePanelType,
    setSelectedCompanyId: store.setSelectedCompanyId,
    closeCrmSidePanel: store.closeCrmSidePanel,
    updateCompany: store.updateCompany
  }));

  const selectedCompany = getCompanyById(selectedCompanyId!);

  const { data: openTaskData, isLoading: isTaskLoading } =
    useGetOpenTasksByCompany(selectedCompanyId!, !!selectedCompanyId);

  const {
    data: completedTaskData,
    isLoading: isCompletedTaskLoading,
    fetchNextPage: fetchNextCompletedTasksPage,
    hasNextPage: hasNextCompletedTasksPage,
    isFetchingNextPage: isFetchingNextCompletedTasksPage
  } = useGetCompletedTasksByCompany(
    selectedCompanyId!,
    TASK_PAGE_SIZE,
    !!selectedCompanyId
  );

  const completedTasks = useMemo(
    () => completedTaskData?.pages.flatMap((page) => page.items) ?? [],
    [completedTaskData]
  );

  const taskData = useMemo(
    () => [...(openTaskData?.tasks ?? []), ...completedTasks],
    [openTaskData, completedTasks]
  );

  const { data: dealData, isLoading: isDealLoading } = useGetDealsByCompany(
    selectedCompanyId!,
    !!selectedCompanyId
  );

  const { data: contactData, isLoading: isContactLoading } =
    useGetContactsByCompany(selectedCompanyId!, !!selectedCompanyId);

  const isLoading =
    isTaskLoading ||
    isDealLoading ||
    isContactLoading ||
    isCompletedTaskLoading;

  useEffect(() => {
    if (!selectedCompanyId) return;

    updateCompany({
      id: selectedCompanyId,
      tasks: taskData,
      deals: dealData?.items,
      contacts: contactData?.items
    });
  }, [selectedCompanyId, taskData, dealData, contactData]);

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL;

  const handleClose = () => {
    setSelectedCompanyId(null);
    closeCrmSidePanel();
  };

  const menuItems: MenuItemProps[] = useMemo(
    () => [
      {
        id: "edit",
        label: translateText(["editCompany"]),
        icon: { start: <EditIcon width="16px" height="16px" /> },
        onClick: () => {
          setCompanyModalType(CrmModalTypes.EDIT_COMPANY_MODAL);
          setIsCompanyModalOpen(true);
        }
      },
      {
        id: "delete",
        label: translateText(["deleteCompany"]),
        icon: {
          start: (
            <DeleteButtonIcon
              width="12px"
              height="14px"
              fill="var(--color-semantic-red-text)"
            />
          )
        },
        activeBehavior:
          "hover:bg-semantic-red-background text-semantic-red-text",
        onClick: () => {
          setCompanyModalType(CrmModalTypes.DELETE_COMPANY_MODAL);
          setIsCompanyModalOpen(true);
        }
      }
    ],
    [translateText]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case SidePanelTabEnum.DEALS:
        return <SidePanelDealSection deals={selectedCompany?.deals} />;
      case SidePanelTabEnum.TASKS:
        return (
          <SidePanelTasksSection
            tasks={selectedCompany?.tasks ?? []}
            hasNextPage={hasNextCompletedTasksPage}
            isFetchingNextPage={isFetchingNextCompletedTasksPage}
            onLoadMoreCompletedTasks={fetchNextCompletedTasksPage}
          />
        );
      case SidePanelTabEnum.CONTACTS:
        return <SidePanelCompanyContacts contacts={selectedCompany?.contacts} />;
      default:
        return null;
    }
  };

  const tabs: TabItem[] = [
    {
      id: SidePanelTabEnum.TASKS,
      label: translateText(["tabs", "tasks"])
    },
    {
      id: SidePanelTabEnum.DEALS,
      label: translateText(["tabs", "deals"])
    },
    {
      id: SidePanelTabEnum.CONTACTS,
      label: translateText(["tabs", "contacts"])
    }
  ];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBackdropClick
      header={
        isLoading ? (
          <SidePanelHeaderSkeleton isShowLastUpdate={false} />
        ) : (
          <h2 className="h1 pl-2 text-black">{selectedCompany?.name}</h2>
        )
      }
      headerActions={
        isLoading ? (
          <SidePanelHeaderActionsSkeleton count={1} />
        ) : (
          <CompanySidePanelHeaderActions
            isCrmSalesManager={Boolean(isCrmSalesManager)}
            menuItems={menuItems}
          />
        )
      }
    >
      <div className="flex flex-col pb-4 gap-4">
        {isLoading ? (
          <CompanySidePanelSkeleton />
        ) : (
          <>
            <SidePanelCompanyHeader company={selectedCompany} />

            <SidePanelMetricCards
              metrics={mapCompanyToMetricItems(selectedCompany, translateText)}
            />
            <div className="flex flex-col pt-2 w-full">
              <Tabs
                tabs={tabs}
                activeTabId={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as SidePanelTabEnum)}
              />
              <hr className="border-secondary-accent" />
            </div>

            {renderTabContent()}
          </>
        )}
      </div>
    </SidePanel>
  );
};

export default CompanySidePanel;
