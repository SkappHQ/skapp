import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
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
import RecordActivitiesTab from "~community/crm/activities/components/organisms/RecordActivitiesTab/RecordActivitiesTab";
import {
  useGetContactById,
  useGetContactMetrics
} from "~community/crm/api/ContactApi";
import { useGetDealsInfinite } from "~community/crm/api/DealApi";
import SidePanelContactHeader from "~community/crm/components/molecules/SidePanelContactHeader/SidePanelContactHeader";
import SidePanelContactInfo from "~community/crm/components/molecules/SidePanelContactInfo/SidePanelContactInfo";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelMetricCards from "~community/crm/components/molecules/SidePanelMetricCards/SidePanelMetricCards";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import { DEAL_PAGE_SIZE } from "~community/crm/constants/commonConstants";
import {
  CrmActivityAssociationEnum,
  CrmSidePanelTabEnum
} from "~community/crm/enums/common";
import { useRecordActivityTab } from "~community/crm/hooks/useRecordActivityTab";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEntity,
  CrmDealEntity
} from "~community/crm/types/CrmCommonTypes";
import {
  CrmDealFilterRequest,
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/types/CrmTypes";
import {
  getContactMetricItems,
  updateContact
} from "~community/crm/utils/contactUtil";
import {
  linkDealToRelatedEntities,
  mergeDeals,
  toDealIds
} from "~community/crm/utils/dealUtil";

import ContactSidePanelSkeleton from "./ContactSidePanelSkeleton";

interface ContactSidePanelProps {
  contactId: number;
}

const ContactSidePanel: FC<ContactSidePanelProps> = ({ contactId }) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const [activeTab, setActiveTab] = useState<CrmSidePanelTabEnum>(
    CrmSidePanelTabEnum.ACTIVITIES
  );
  const [activityTab, setActivityTab] = useRecordActivityTab(contactId);

  const {
    contacts,
    companies,
    deals,
    isCrmSidePanelOpen,
    crmSidePanelType,
    setContacts,
    setCompanies,
    setDeals,
    setIsContactModalOpen,
    setContactModalType,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      contacts: state.contacts,
      companies: state.companies,
      deals: state.deals,
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setContacts: state.setContacts,
      setCompanies: state.setCompanies,
      setDeals: state.setDeals,
      setIsContactModalOpen: state.setIsContactModalOpen,
      setContactModalType: state.setContactModalType,
      closeCrmSidePanel: state.closeCrmSidePanel
    }))
  );

  const { isCrmSalesManager, userId } = useSessionData();

  const handleLoadError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "contacts",
        "sidePanel",
        "errors",
        "contactNotFoundTitle"
      ]),
      description: translateText([
        "contacts",
        "sidePanel",
        "errors",
        "contactNotFoundDescription"
      ])
    });
    closeCrmSidePanel();
  };

  const { setToastMessage } = useToast();

  const dealFilters: CrmDealFilterRequest = {
    contactId,
    size: DEAL_PAGE_SIZE
  };

  const {
    data: fetchedContact,
    isLoading: isContactLoading,
    isError: isContactError,
    isFetching: isContactFetching
  } = useGetContactById(contactId);
  const {
    data: fetchedMetrics,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    isFetching: isMetricsFetching
  } = useGetContactMetrics(contactId);
  const {
    data: fetchedDeals,
    isLoading: isDealsLoading,
    fetchNextPage: fetchNextDealsPage,
    hasNextPage: hasNextDealsPage,
    isFetchingNextPage: isFetchingNextDealsPage
  } = useGetDealsInfinite(dealFilters);

  const isLoading = isContactLoading || isMetricsLoading || isDealsLoading;

  useEffect(() => {
    if (
      (isContactError && !isContactFetching) ||
      (isMetricsError && !isMetricsFetching)
    ) {
      handleLoadError();
    }
  }, [isContactError, isContactFetching, isMetricsError, isMetricsFetching]);

  useEffect(() => {
    if (fetchedMetrics) {
      setContacts(
        updateContact(contacts, contactId, { metrics: fetchedMetrics })
      );
    }
  }, [contactId, fetchedMetrics]);

  useEffect(() => {
    const contactFields: CrmContactEntity = {};

    if (fetchedContact) {
      Object.assign(contactFields, fetchedContact);
    }

    if (fetchedDeals) {
      const dealItems = fetchedDeals.pages.flatMap((page) => page?.items ?? []);

      setDeals(mergeDeals(deals, dealItems));
      contactFields.dealIds = toDealIds(dealItems);
    }

    setContacts(updateContact(contacts, contactId, contactFields));
  }, [contactId, fetchedContact, fetchedDeals]);

  const contact = contacts[contactId];

  const canEditContact =
    isCrmSalesManager || (userId != null && contact?.ownerId === userId);

  const canDeleteContact = isCrmSalesManager;

  const handleDealCreated = (createdDeal: CrmDealEntity) => {
    setDeals(mergeDeals(deals, [createdDeal]));

    const linked = linkDealToRelatedEntities(createdDeal, companies, contacts);

    setCompanies({ ...companies, ...linked.companies });
    setContacts({ ...contacts, ...linked.contacts });
  };

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.CONTACT_SIDE_PANEL;

  const menuItems: MenuItemProps[] = useMemo(() => {
    const items: MenuItemProps[] = [];

    if (canEditContact) {
      items.push({
        id: "edit",
        label: translateText(["contacts", "sidePanel", "editContact"]),
        icon: { start: <EditIcon width="16px" height="16px" /> },
        onClick: () => {
          setContactModalType(CrmModalTypes.EDIT_CONTACT_MODAL);
          setIsContactModalOpen(true);
        }
      });
    }

    if (canDeleteContact) {
      items.push({
        id: "delete",
        label: translateText(["contacts", "sidePanel", "deleteContact"]),
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
          setContactModalType(CrmModalTypes.DELETE_CONTACT_MODAL);
          setIsContactModalOpen(true);
        }
      });
    }

    return items;
  }, [translateText, canEditContact, canDeleteContact]);

  const tabs: TabItem[] = [
    {
      id: CrmSidePanelTabEnum.ACTIVITIES,
      label: translateText(["activities", "recordTab", "tabLabel"])
    },
    {
      id: CrmSidePanelTabEnum.DEALS,
      label: translateText(["contacts", "sidePanel", "tabs", "deals"])
    }
  ];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={closeCrmSidePanel}
      closeOnBackdropClick
      header={
        isLoading ? (
          <SidePanelHeaderSkeleton isShowLastUpdate={true} />
        ) : (
          <SidePanelContactHeader
            name={contact?.name}
            lastModifiedDate={contact?.lastModifiedDate}
          />
        )
      }
      headerActions={
        isLoading ? (
          <SidePanelHeaderActionsSkeleton />
        ) : (
          menuItems.length > 0 && (
            <KebabMenu
              id="contact-actions"
              menuItems={menuItems}
              anchorButton={{
                "aria-label": translateAria([
                  "contacts",
                  "sidePanel",
                  "kebabMenu"
                ])
              }}
              className={{
                anchorElement:
                  "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
              }}
            />
          )
        )
      }
    >
      <div className="flex flex-col pb-4 gap-4">
        {isLoading || !contact ? (
          <ContactSidePanelSkeleton />
        ) : (
          <>
            <SidePanelContactInfo contact={contact} />

            <SidePanelMetricCards
              metrics={getContactMetricItems(contact, translateText)}
            />

            <div className="flex flex-col pt-2 w-full">
              <Tabs
                tabs={tabs}
                activeTabId={activeTab}
                onTabChange={(tabId) => {
                  if (
                    tabId === CrmSidePanelTabEnum.ACTIVITIES ||
                    tabId === CrmSidePanelTabEnum.DEALS
                  ) {
                    setActiveTab(tabId);
                  }
                }}
              />
              <hr className="border-secondary-accent" />
            </div>

            {activeTab === CrmSidePanelTabEnum.ACTIVITIES && (
              <RecordActivitiesTab
                key={contactId}
                id="contact-activities"
                recordType={CrmActivityAssociationEnum.CONTACT}
                recordId={contactId}
                activeTab={activityTab}
                onTabChange={setActivityTab}
              />
            )}

            {activeTab === CrmSidePanelTabEnum.DEALS && (
              <SidePanelDealSection
                dealIds={contact.dealIds}
                onDealCreated={handleDealCreated}
                companyId={contact.companyId}
                defaultContact={contact}
                emptyDescription={translateText([
                  "contacts",
                  "sidePanel",
                  "deals",
                  "emptyDescription"
                ])}
                hasNextPage={hasNextDealsPage}
                isFetchingNextPage={isFetchingNextDealsPage}
                onFetchNextPage={fetchNextDealsPage}
              />
            )}
          </>
        )}
      </div>
    </SidePanel>
  );
};

export default ContactSidePanel;
