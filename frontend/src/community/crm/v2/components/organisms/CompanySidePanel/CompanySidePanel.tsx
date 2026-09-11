import {
  DeleteButtonIcon,
  EditIcon,
  MenuItemProps,
  SidePanel,
  TabItem,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetCompanyById,
  useGetCompanyMetrics
} from "~community/crm/v2/api/CompanyApi";
import { useGetContactsInfinite } from "~community/crm/v2/api/ContactApi";
import { useGetDealsInfinite } from "~community/crm/v2/api/DealApi";
import { useGetTasksInfinite } from "~community/crm/v2/api/TaskApi";
import SidePanelCompanyHeader from "~community/crm/v2/components/molecules/SidePanelCompanyHeader/SidePanelCompanyHeader";
import SidePanelContactsSection from "~community/crm/v2/components/molecules/SidePanelContactsSection/SidePanelContactsSection";
import SidePanelDealSection from "~community/crm/v2/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelMetricCards from "~community/crm/v2/components/molecules/SidePanelMetricCards/SidePanelMetricCards";
import SidePanelHeaderActionsSkeleton from "~community/crm/v2/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/v2/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import {
  CONTACT_PAGE_SIZE,
  DEAL_PAGE_SIZE
} from "~community/crm/v2/constants/commonConstants";
import { TASK_PAGE_SIZE } from "~community/crm/v2/constants/taskConstants";
import { CrmSidePanelTabEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmCompanyEntity,
  CrmDealEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmContactFilterRequest,
  CrmDealFilterRequest,
  CrmModalTypes,
  CrmSidePanelTypes,
  CrmTaskFilterRequest
} from "~community/crm/v2/types/CrmTypes";
import {
  getCompanyMetricItems,
  updateCompany
} from "~community/crm/v2/utils/companyUtil";
import {
  toContactIds,
  updateContactRecord
} from "~community/crm/v2/utils/contactUtil";
import {
  linkDealToRelatedEntities,
  toDealIds,
  updateDealRecord
} from "~community/crm/v2/utils/dealUtil";
import { toTaskIds, updateTaskRecord } from "~community/crm/v2/utils/taskUtil";

import CompanySidePanelHeaderActions from "./CompanySidePanelHeaderActions";
import CompanySidePanelSkeleton from "./CompanySidePanelSkeleton";

interface CompanySidePanelProps {
  companyId: number;
}

const CompanySidePanel: FC<CompanySidePanelProps> = ({ companyId }) => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");
  const { isCrmSalesManager } = useSessionData();
  const { setToastMessage } = useToast();

  const [activeTab, setActiveTab] = useState<CrmSidePanelTabEnum>(
    CrmSidePanelTabEnum.TASKS
  );

  const {
    companies,
    tasks,
    isCrmDataInitialized,
    deals,
    contacts,
    isCrmSidePanelOpen,
    crmSidePanelType,
    setCompanies,
    setTasks,
    setDeals,
    setContacts,
    setSelectedCompanyId,
    setIsCompanyModalOpen,
    setCompanyModalType,
    closeCrmSidePanel
  } = useCrmStoreV2(
    useShallow((state) => ({
      companies: state.companies,
      tasks: state.tasks,
      isCrmDataInitialized: state.isCrmDataInitialized,
      deals: state.deals,
      contacts: state.contacts,
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setCompanies: state.setCompanies,
      setTasks: state.setTasks,
      setDeals: state.setDeals,
      setContacts: state.setContacts,
      setSelectedCompanyId: state.setSelectedCompanyId,
      setIsCompanyModalOpen: state.setIsCompanyModalOpen,
      setCompanyModalType: state.setCompanyModalType,
      closeCrmSidePanel: state.closeCrmSidePanel
    }))
  );

  const handleClose = () => {
    setSelectedCompanyId(null);
    closeCrmSidePanel();
  };

  const handleLoadError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errors", "companyNotFoundTitle"]),
      description: translateText(["errors", "companyNotFoundDescription"])
    });
    handleClose();
  };

  const taskFilters: CrmTaskFilterRequest = {
    companyId,
    size: TASK_PAGE_SIZE
  };

  const dealFilters: CrmDealFilterRequest = {
    companyId,
    size: DEAL_PAGE_SIZE
  };

  const contactFilters: CrmContactFilterRequest = {
    companyId,
    size: CONTACT_PAGE_SIZE
  };

  const { data: fetchedCompany, isLoading: isCompanyLoading } =
    useGetCompanyById(companyId, handleLoadError);
  const { data: fetchedMetrics, isLoading: isMetricsLoading } =
    useGetCompanyMetrics(companyId, handleLoadError);
  const {
    data: fetchedTasks,
    isLoading: isTasksLoading,
    fetchNextPage: fetchNextTasksPage,
    hasNextPage: hasNextTasksPage,
    isFetchingNextPage: isFetchingNextTasksPage
  } = useGetTasksInfinite(taskFilters);
  const {
    data: fetchedDeals,
    isLoading: isDealsLoading,
    fetchNextPage: fetchNextDealsPage,
    hasNextPage: hasNextDealsPage,
    isFetchingNextPage: isFetchingNextDealsPage
  } = useGetDealsInfinite(dealFilters);
  const {
    data: fetchedContacts,
    isLoading: isContactsLoading,
    fetchNextPage: fetchNextContactsPage,
    hasNextPage: hasNextContactsPage,
    isFetchingNextPage: isFetchingNextContactsPage
  } = useGetContactsInfinite(contactFilters);

  const isLoading =
    !isCrmDataInitialized ||
    isCompanyLoading ||
    isMetricsLoading ||
    isTasksLoading ||
    isDealsLoading ||
    isContactsLoading;

  useEffect(() => {
    const companyFields: CrmCompanyEntity = {};

    if (fetchedCompany && fetchedMetrics) {
      Object.assign(companyFields, fetchedCompany, { metrics: fetchedMetrics });
    }

    if (fetchedTasks) {
      const taskItems = fetchedTasks.pages.flatMap((page) => page.items ?? []);

      setTasks(updateTaskRecord(tasks, taskItems));
      companyFields.taskIds = toTaskIds(taskItems);
    }

    if (fetchedDeals) {
      const dealItems = fetchedDeals.pages.flatMap((page) => page.items ?? []);

      setDeals(updateDealRecord(deals, dealItems));
      companyFields.dealIds = toDealIds(dealItems);
    }

    if (fetchedContacts) {
      const contactItems = fetchedContacts.pages.flatMap(
        (page) => page.items ?? []
      );

      setContacts(updateContactRecord(contacts, contactItems));
      companyFields.contactIds = toContactIds(contactItems);
    }

    setCompanies(updateCompany(companies, companyId, companyFields));
  }, [
    companyId,
    fetchedCompany,
    fetchedMetrics,
    fetchedTasks,
    fetchedDeals,
    fetchedContacts
  ]);

  const handleDealCreated = (createdDeal: CrmDealEntity) => {
    setDeals(updateDealRecord(deals, [createdDeal]));

    const linked = linkDealToRelatedEntities(createdDeal, companies, contacts);

    setCompanies({ ...companies, ...linked.companies });
    setContacts({ ...contacts, ...linked.contacts });
  };

  const company = companies[companyId];

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL;

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

  const tabs: TabItem[] = [
    {
      id: CrmSidePanelTabEnum.TASKS,
      label: translateText(["tabs", "tasks"])
    },
    {
      id: CrmSidePanelTabEnum.DEALS,
      label: translateText(["tabs", "deals"])
    },
    {
      id: CrmSidePanelTabEnum.CONTACTS,
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
          <h2 className="h1 pl-2 text-black">{company?.name}</h2>
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
        {isLoading || !company ? (
          <CompanySidePanelSkeleton />
        ) : (
          <>
            <SidePanelCompanyHeader company={company} />

            <SidePanelMetricCards
              metrics={getCompanyMetricItems(company, translateText)}
            />
            <div className="flex flex-col pt-2 w-full">
              <Tabs
                tabs={tabs}
                activeTabId={activeTab}
                onTabChange={(tabId) =>
                  setActiveTab(tabId as CrmSidePanelTabEnum)
                }
              />
              <hr className="border-secondary-accent" />
            </div>

            {activeTab === CrmSidePanelTabEnum.DEALS && (
              <SidePanelDealSection
                dealIds={company.dealIds}
                onDealCreated={handleDealCreated}
                companyId={companyId}
                hasNextPage={hasNextDealsPage}
                isFetchingNextPage={isFetchingNextDealsPage}
                onFetchNextPage={fetchNextDealsPage}
              />
            )}

            {activeTab === CrmSidePanelTabEnum.CONTACTS && (
              <SidePanelContactsSection
                contactIds={company.contactIds}
                hasNextPage={hasNextContactsPage}
                isFetchingNextPage={isFetchingNextContactsPage}
                onFetchNextPage={fetchNextContactsPage}
              />
            )}

            {activeTab === CrmSidePanelTabEnum.TASKS && (
              <SidePanelTasksSection
                taskIds={company.taskIds}
                hasNextPage={hasNextTasksPage}
                isFetchingNextPage={isFetchingNextTasksPage}
                onFetchNextPage={fetchNextTasksPage}
                emptyDescription={translateText(["tasks", "emptyDescription"])}
              />
            )}
          </>
        )}
      </div>
    </SidePanel>
  );
};

export default CompanySidePanel;
