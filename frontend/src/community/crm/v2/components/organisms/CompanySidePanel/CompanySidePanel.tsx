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

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCompanyById,
  useGetCompanyMetrics
} from "~community/crm/v2/api/CompanyApi";
import { useGetTasksInfinite } from "~community/crm/v2/api/TaskApi";
import SidePanelCompanyHeader from "~community/crm/v2/components/molecules/SidePanelCompanyHeader/SidePanelCompanyHeader";
import SidePanelMetricCards from "~community/crm/v2/components/molecules/SidePanelMetricCards/SidePanelMetricCards";
import SidePanelHeaderActionsSkeleton from "~community/crm/v2/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/v2/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { TASK_PAGE_SIZE } from "~community/crm/v2/constants/commonConstants";
import { CrmSidePanelTabEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmModalTypes,
  CrmSidePanelTypes,
  CrmTaskCompletedFilterRequest
} from "~community/crm/v2/types/CrmTypes";
import {
  getCompanyMetricItems,
  updateCompany
} from "~community/crm/v2/utils/companyUtil";
import { normalizeTasks } from "~community/crm/v2/utils/taskUtil";

import CompanySidePanelHeaderActions from "./CompanySidePanelHeaderActions";
import CompanySidePanelSkeleton from "./CompanySidePanelSkeleton";

interface CompanySidePanelProps {
  companyId: number;
}

const CompanySidePanel: FC<CompanySidePanelProps> = ({ companyId }) => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");
  const { isCrmSalesManager } = useSessionData();

  const [activeTab, setActiveTab] = useState<CrmSidePanelTabEnum>(
    CrmSidePanelTabEnum.TASKS
  );

  const {
    companies,
    tasks,
    isCrmSidePanelOpen,
    crmSidePanelType,
    setCompanies,
    setTasks,
    setSelectedCompanyId,
    setIsCompanyModalOpen,
    setCompanyModalType,
    closeCrmSidePanel
  } = useCrmStoreV2(
    useShallow((store) => ({
      companies: store.companies,
      tasks: store.tasks,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      setCompanies: store.setCompanies,
      setTasks: store.setTasks,
      setSelectedCompanyId: store.setSelectedCompanyId,
      setIsCompanyModalOpen: store.setIsCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType,
      closeCrmSidePanel: store.closeCrmSidePanel
    }))
  );

  const taskFilters: CrmTaskCompletedFilterRequest = {
    companyId,
    size: TASK_PAGE_SIZE
  };

  const { data: fetchedCompany, isLoading: isCompanyLoading } =
    useGetCompanyById(companyId);
  const { data: fetchedMetrics, isLoading: isMetricsLoading } =
    useGetCompanyMetrics(companyId);
  const {
    data: fetchedTasks,
    isLoading: isTasksLoading,
    fetchNextPage: fetchNextTasksPage,
    hasNextPage: hasNextTasksPage,
    isFetchingNextPage: isFetchingNextTasksPage
  } = useGetTasksInfinite(taskFilters);

  const isLoading = isCompanyLoading || isMetricsLoading || isTasksLoading;

  useEffect(() => {
    if (!fetchedCompany || !fetchedMetrics || !fetchedTasks) return;

    const taskItems = fetchedTasks.pages.flatMap((page) => page.items);
    const normalizedTasks = normalizeTasks(taskItems);

    setTasks({ ...tasks, ...normalizedTasks.tasks });
    setCompanies(
      updateCompany(companies, companyId, {
        ...fetchedCompany,
        metrics: fetchedMetrics,
        taskIds: normalizedTasks.taskIds
      })
    );
  }, [fetchedCompany, fetchedMetrics, fetchedTasks]);

  const company = companies[companyId];

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
