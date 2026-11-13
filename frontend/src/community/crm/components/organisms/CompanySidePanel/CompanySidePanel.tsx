import {
  DeleteButtonIcon,
  EditIcon,
  MenuItemProps,
  SidePanel,
  TabItem,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import RecordActivitiesTab from "~community/crm/activities/components/organisms/RecordActivitiesTab/RecordActivitiesTab";
import {
  useGetCompanyById,
  useGetCompanyMetrics
} from "~community/crm/api/CompanyApi";
import { useGetContactsInfinite } from "~community/crm/api/ContactApi";
import { useGetDealsInfinite } from "~community/crm/api/DealApi";
import SidePanelCompanyHeader from "~community/crm/components/molecules/SidePanelCompanyHeader/SidePanelCompanyHeader";
import SidePanelContactsSection from "~community/crm/components/molecules/SidePanelContactsSection/SidePanelContactsSection";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelMetricCards from "~community/crm/components/molecules/SidePanelMetricCards/SidePanelMetricCards";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import {
  CONTACT_PAGE_SIZE,
  DEAL_PAGE_SIZE
} from "~community/crm/constants/commonConstants";
import {
  CrmActivityAssociationEnum,
  CrmSidePanelTabEnum
} from "~community/crm/enums/common";
import { useIndustryNameMapper } from "~community/crm/hooks/useIndustryNameMapper";
import { useRecordActivityTab } from "~community/crm/hooks/useRecordActivityTab";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompanyEntity,
  CrmDealEntity
} from "~community/crm/types/CrmCommonTypes";
import {
  CrmContactFilterRequest,
  CrmDealFilterRequest,
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/types/CrmTypes";
import {
  getCompanyMetricItems,
  updateCompany
} from "~community/crm/utils/companyUtil";
import {
  toContactIds,
  updateContactRecord
} from "~community/crm/utils/contactUtil";
import {
  linkDealToRelatedEntities,
  mergeDeals,
  toDealIds
} from "~community/crm/utils/dealUtil";

import CompanySidePanelHeaderActions from "./CompanySidePanelHeaderActions";
import CompanySidePanelSkeleton from "./CompanySidePanelSkeleton";

interface CompanySidePanelProps {
  companyId: number;
}

const CompanySidePanel: FC<CompanySidePanelProps> = ({ companyId }) => {
  const translateText = useTranslator("crmModule");
  const { isCrmSalesManager } = useSessionData();
  const { setToastMessage } = useToast();
  const { getIndustryByName } = useIndustryNameMapper();

  const [activeTab, setActiveTab] = useState<CrmSidePanelTabEnum>(
    CrmSidePanelTabEnum.ACTIVITIES
  );
  const [activityTab, setActivityTab] = useRecordActivityTab(companyId);

  const {
    companies,
    industries,
    isCrmDataInitialized,
    deals,
    contacts,
    isCrmSidePanelOpen,
    crmSidePanelType,
    setCompanies,
    setDeals,
    setContacts,
    setSelectedCompanyId,
    setIsCompanyModalOpen,
    setCompanyModalType,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      companies: state.companies,
      industries: state.industries,
      isCrmDataInitialized: state.isCrmDataInitialized,
      deals: state.deals,
      contacts: state.contacts,
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setCompanies: state.setCompanies,
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
      title: translateText([
        "companies",
        "sidePanel",
        "errors",
        "companyNotFoundTitle"
      ]),
      description: translateText([
        "companies",
        "sidePanel",
        "errors",
        "companyNotFoundDescription"
      ])
    });
    handleClose();
  };

  const dealFilters: CrmDealFilterRequest = {
    companyId,
    size: DEAL_PAGE_SIZE
  };

  const contactFilters: CrmContactFilterRequest = {
    companyId,
    size: CONTACT_PAGE_SIZE
  };

  const {
    data: fetchedCompany,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    isFetching: isCompanyFetching
  } = useGetCompanyById(companyId);
  const {
    data: fetchedMetrics,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    isFetching: isMetricsFetching
  } = useGetCompanyMetrics(companyId);
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
    isDealsLoading ||
    isContactsLoading;

  useEffect(() => {
    if (
      (isCompanyError && !isCompanyFetching) ||
      (isMetricsError && !isMetricsFetching)
    ) {
      handleLoadError();
    }
  }, [isCompanyError, isCompanyFetching, isMetricsError, isMetricsFetching]);

  useEffect(() => {
    if (fetchedMetrics) {
      setCompanies(
        updateCompany(companies, companyId, { metrics: fetchedMetrics })
      );
    }
  }, [companyId, fetchedMetrics]);

  useEffect(() => {
    const companyFields: CrmCompanyEntity = {};

    if (fetchedCompany) {
      Object.assign(companyFields, fetchedCompany);
    }

    if (fetchedDeals) {
      const dealItems = fetchedDeals.pages.flatMap((page) => page?.items ?? []);

      setDeals(mergeDeals(deals, dealItems));
      companyFields.dealIds = toDealIds(dealItems);
    }

    if (fetchedContacts) {
      const contactItems = fetchedContacts.pages.flatMap(
        (page) => page?.items ?? []
      );

      setContacts(updateContactRecord(contacts, contactItems));
      companyFields.contactIds = toContactIds(contactItems);
    }

    setCompanies(updateCompany(companies, companyId, companyFields));
  }, [companyId, fetchedCompany, fetchedDeals, fetchedContacts]);

  const handleDealCreated = (createdDeal: CrmDealEntity) => {
    setDeals(mergeDeals(deals, [createdDeal]));

    const linked = linkDealToRelatedEntities(createdDeal, companies, contacts);

    setCompanies({ ...companies, ...linked.companies });
    setContacts({ ...contacts, ...linked.contacts });
  };

  const company = companies[companyId];
  const industry =
    company?.industryId != null ? industries[company.industryId] : undefined;

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL;

  const menuItems: MenuItemProps[] = [
    {
      id: "edit",
      label: translateText(["companies", "sidePanel", "editCompany"]),
      icon: { start: <EditIcon width="16px" height="16px" /> },
      onClick: () => {
        setCompanyModalType(CrmModalTypes.EDIT_COMPANY_MODAL);
        setIsCompanyModalOpen(true);
      }
    },
    {
      id: "delete",
      label: translateText(["companies", "sidePanel", "deleteCompany"]),
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
      onClick: () => {
        setCompanyModalType(CrmModalTypes.DELETE_COMPANY_MODAL);
        setIsCompanyModalOpen(true);
      }
    }
  ];

  const tabs: TabItem[] = [
    {
      id: CrmSidePanelTabEnum.ACTIVITIES,
      label: translateText(["activities", "recordTab", "tabLabel"])
    },
    {
      id: CrmSidePanelTabEnum.DEALS,
      label: translateText(["companies", "sidePanel", "tabs", "deals"])
    },
    {
      id: CrmSidePanelTabEnum.CONTACTS,
      label: translateText(["companies", "sidePanel", "tabs", "contacts"])
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
            <SidePanelCompanyHeader
              company={company}
              industryName={
                industry?.name ? getIndustryByName(industry.name) : undefined
              }
            />

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
                hasNextPage={hasNextContactsPage}
                isFetchingNextPage={isFetchingNextContactsPage}
                onFetchNextPage={fetchNextContactsPage}
              />
            )}

            {activeTab === CrmSidePanelTabEnum.ACTIVITIES && (
              <RecordActivitiesTab
                key={companyId}
                id="company-activities"
                activityAssociation={CrmActivityAssociationEnum.COMPANY}
                recordId={companyId}
                activeTab={activityTab}
                onTabChange={setActivityTab}
              />
            )}
          </>
        )}
      </div>
    </SidePanel>
  );
};

export default CompanySidePanel;
