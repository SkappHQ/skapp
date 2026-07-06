import {
  DeleteButtonIcon,
  EditIcon,
  MenuItemProps,
  SidePanel,
  TabItem,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

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
    selectedCompany,
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedCompany,
    closeCrmSidePanel
  } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen,
    setCompanyModalType: store.setCompanyModalType,
    selectedCompany: store.selectedCompany,
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    crmSidePanelType: store.crmSidePanelType,
    setSelectedCompany: store.setSelectedCompany,
    closeCrmSidePanel: store.closeCrmSidePanel
  }));

  const { data: openTaskData, isLoading: isTaskLoading } =
    useGetOpenTasksByCompany(selectedCompany?.id, !!selectedCompany?.id);

  const { data: completedTaskData, isLoading: isCompletedTaskLoading } =
    useGetCompletedTasksByCompany(
      selectedCompany?.id,
      TASK_PAGE_SIZE,
      !!selectedCompany?.id
    );

  const taskData = useMemo(
    () => [
      ...(openTaskData?.tasks ?? []),
      ...(completedTaskData?.pages.flatMap((page) => page.items) ?? [])
    ],
    [openTaskData, completedTaskData]
  );

  const { data: dealData, isLoading: isDealLoading } = useGetDealsByCompany(
    selectedCompany?.id,
    !!selectedCompany?.id
  );

  const { data: contactData, isLoading: isContactLoading } =
    useGetContactsByCompany(selectedCompany?.id, !!selectedCompany?.id);

  const isLoading =
    isTaskLoading ||
    isDealLoading ||
    isContactLoading ||
    isCompletedTaskLoading;

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL;

  const handleClose = () => {
    setSelectedCompany(null);
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
        return <SidePanelDealSection deals={dealData?.items} />;
      case SidePanelTabEnum.TASKS:
        return <SidePanelTasksSection tasks={taskData} />;
      case SidePanelTabEnum.CONTACTS:
        return <SidePanelCompanyContacts contacts={contactData?.items} />;
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
