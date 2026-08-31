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

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetContactById,
  useGetContactMetrics
} from "~community/crm/v2/api/ContactApi";
import { useGetDealsInfinite } from "~community/crm/v2/api/DealApi";
import { useGetTasksInfinite } from "~community/crm/v2/api/TaskApi";
import SidePanelContactHeader from "~community/crm/v2/components/molecules/SidePanelContactHeader/SidePanelContactHeader";
import SidePanelContactInfo from "~community/crm/v2/components/molecules/SidePanelContactInfo/SidePanelContactInfo";
import SidePanelDealSection from "~community/crm/v2/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelMetricCards from "~community/crm/v2/components/molecules/SidePanelMetricCards/SidePanelMetricCards";
import SidePanelHeaderActionsSkeleton from "~community/crm/v2/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/v2/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import {
  DEAL_PAGE_SIZE,
  TASK_PAGE_SIZE
} from "~community/crm/v2/constants/commonConstants";
import { CrmSidePanelTabEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmDealFilterRequest,
  CrmModalTypes,
  CrmSidePanelTypes,
  CrmTaskFilterRequest
} from "~community/crm/v2/types/CrmTypes";
import {
  getContactMetricItems,
  updateContact
} from "~community/crm/v2/utils/contactUtil";
import {
  linkDealToRelatedEntities,
  mergeDeals,
  toDealIds
} from "~community/crm/v2/utils/dealUtil";
import { normalizeTasks } from "~community/crm/v2/utils/taskUtil";

import ContactSidePanelSkeleton from "./ContactSidePanelSkeleton";

interface ContactSidePanelProps {
  contactId: number;
}

const ContactSidePanel: FC<ContactSidePanelProps> = ({ contactId }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  const [activeTab, setActiveTab] = useState<CrmSidePanelTabEnum>(
    CrmSidePanelTabEnum.TASKS
  );

  const {
    contacts,
    companies,
    tasks,
    deals,
    isCrmSidePanelOpen,
    crmSidePanelType,
    setContacts,
    setCompanies,
    setTasks,
    setDeals,
    setSelectedContactId,
    setIsContactModalOpen,
    setContactModalType,
    closeCrmSidePanel
  } = useCrmStoreV2(
    useShallow((store) => ({
      contacts: store.contacts,
      companies: store.companies,
      tasks: store.tasks,
      deals: store.deals,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      setContacts: store.setContacts,
      setCompanies: store.setCompanies,
      setTasks: store.setTasks,
      setDeals: store.setDeals,
      setSelectedContactId: store.setSelectedContactId,
      setIsContactModalOpen: store.setIsContactModalOpen,
      setContactModalType: store.setContactModalType,
      closeCrmSidePanel: store.closeCrmSidePanel
    }))
  );

  const { isCrmSalesManager, userId } = useSessionData();

  const taskFilters: CrmTaskFilterRequest = {
    contactId,
    size: TASK_PAGE_SIZE
  };

  const dealFilters: CrmDealFilterRequest = {
    contactId,
    size: DEAL_PAGE_SIZE
  };

  const { data: fetchedContact, isLoading: isContactLoading } =
    useGetContactById(contactId);
  const { data: fetchedMetrics, isLoading: isMetricsLoading } =
    useGetContactMetrics(contactId);
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

  const isLoading =
    isContactLoading || isMetricsLoading || isTasksLoading || isDealsLoading;

  useEffect(() => {
    if (!fetchedContact || !fetchedMetrics) return;

    setContacts(
      updateContact(useCrmStoreV2.getState().contacts, contactId, {
        ...fetchedContact,
        metrics: fetchedMetrics
      })
    );
  }, [fetchedContact, fetchedMetrics]);

  useEffect(() => {
    if (!fetchedTasks) return;

    const taskItems = fetchedTasks.pages.flatMap((page) => page.items);
    const normalizedTasks = normalizeTasks(taskItems);

    setTasks({ ...tasks, ...normalizedTasks.tasks });
    setContacts(
      updateContact(useCrmStoreV2.getState().contacts, contactId, {
        taskIds: normalizedTasks.taskIds
      })
    );
  }, [fetchedTasks]);

  useEffect(() => {
    if (!fetchedDeals) return;

    const dealItems = fetchedDeals.pages.flatMap((page) => page.items);

    setDeals(mergeDeals(deals, dealItems));
    setContacts(
      updateContact(useCrmStoreV2.getState().contacts, contactId, {
        dealIds: toDealIds(dealItems)
      })
    );
  }, [fetchedDeals]);

  const contact = contacts[contactId];

  const canEditContact = isCrmSalesManager || contact?.ownerId === userId;

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

  const handleClose = () => {
    setSelectedContactId(null);
    closeCrmSidePanel();
  };

  const menuItems: MenuItemProps[] = useMemo(() => {
    const items: MenuItemProps[] = [];

    if (canEditContact) {
      items.push({
        id: "edit",
        label: translateText(["editContact"]),
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
        label: translateText(["deleteContact"]),
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
      id: CrmSidePanelTabEnum.TASKS,
      label: translateText(["tabs", "tasks"])
    },
    {
      id: CrmSidePanelTabEnum.DEALS,
      label: translateText(["tabs", "deals"])
    }
  ];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
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
                "aria-label": translateText(["kebabMenuAriaLabel"])
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
                onTabChange={(tabId) =>
                  setActiveTab(tabId as CrmSidePanelTabEnum)
                }
              />
              <hr className="border-secondary-accent" />
            </div>

            {activeTab === CrmSidePanelTabEnum.TASKS && (
              <SidePanelTasksSection
                taskIds={contact.taskIds}
                hasNextPage={hasNextTasksPage}
                isFetchingNextPage={isFetchingNextTasksPage}
                onFetchNextPage={fetchNextTasksPage}
              />
            )}

            {activeTab === CrmSidePanelTabEnum.DEALS && (
              <SidePanelDealSection
                dealIds={contact.dealIds}
                onDealCreated={handleDealCreated}
                companyId={contact.companyId}
                defaultContact={contact}
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
