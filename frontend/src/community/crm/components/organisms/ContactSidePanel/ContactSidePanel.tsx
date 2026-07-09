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

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetContactById } from "~community/crm/api/ContactApi";
import SidePanelContactHeader from "~community/crm/components/molecules/SidePanelContactHeader/SidePanelContactHeader";
import SidePanelContactInfo from "~community/crm/components/molecules/SidePanelContactInfo/SidePanelContactInfo";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import SidePanelMetricCards from "~community/crm/components/molecules/SidePanelMetricCards/SidePanelMetricCards";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { SidePanelTabEnum } from "~community/crm/enums/TabTypesEnum";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { mapContactToMetricItems } from "~community/crm/utils/contactUtil";

import ContactSidePanelSkeleton from "./ContactSidePanelSkeleton";

const ContactSidePanel: FC = () => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );
  const { setToastMessage } = useToast();

  const [activeTab, setActiveTab] = useState<SidePanelTabEnum>(
    SidePanelTabEnum.TASKS
  );

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedContactId,
    setSelectedContactId,
    setContactModalType,
    setIsContactModalOpen,
    updateContact,
    closeCrmSidePanel,
    getContactById
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    crmSidePanelType: store.crmSidePanelType,
    selectedContactId: store.selectedContactId,
    setSelectedContactId: store.setSelectedContactId,
    setContactModalType: store.setContactModalType,
    setIsContactModalOpen: store.setIsContactModalOpen,
    updateContact: store.updateContact,
    closeCrmSidePanel: store.closeCrmSidePanel,
    getContactById: store.getContactById
  }));

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.CONTACT_SIDE_PANEL;

  const handleClose = (): void => {
    setSelectedContactId(null);
    closeCrmSidePanel();
  };

  const menuItems: MenuItemProps[] = useMemo(
    () => [
      {
        id: "edit",
        label: translateText(["editContact"]),
        icon: { start: <EditIcon width="16px" height="16px" /> },
        onClick: () => {
          setContactModalType(CrmModalTypes.EDIT_CONTACT_MODAL);
          setIsContactModalOpen(true);
        }
      },
      {
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
        onClick: () => {
          setContactModalType(CrmModalTypes.DELETE_CONTACT_MODAL);
          setIsContactModalOpen(true);
        },
        activeBehavior:
          "hover:bg-semantic-red-background text-semantic-red-text"
      }
    ],
    [translateText]
  );

  const handleContactLoadError = (): void => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["errors", "contactNotFoundTitle"]),
      description: translateText(["errors", "contactNotFoundDescription"])
    });
    handleClose();
  };

  const { data, isError, isLoading } = useGetContactById(
    selectedContactId ?? 0,
    isOpen && !!selectedContactId
  );

  useEffect(() => {
    if (isError && !data) {
      handleContactLoadError();
    } else if (data) {
      updateContact(data);
    }
  }, [data, isError]);

  const contact = getContactById(selectedContactId!);

  const renderTabContent = () => {
    switch (activeTab) {
      case SidePanelTabEnum.DEALS:
        return <SidePanelDealSection deals={data?.deals ?? []} />;
      case SidePanelTabEnum.TASKS:
        return (
          <SidePanelTasksSection
            tasks={data?.tasks ?? []}
            emptyDescription={translateText(["tasks", "emptyDescription"])}
          />
        );
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
      }
    >
      <div className="flex flex-col pb-4 gap-4">
        {isLoading ? (
          <ContactSidePanelSkeleton />
        ) : (
          <>
            <SidePanelContactInfo contact={contact} />
            <SidePanelMetricCards
              metrics={mapContactToMetricItems(contact, translateText)}
            />

            <div className="flex flex-col pt-2 w-full">
              <Tabs
                tabs={tabs}
                activeTabId={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as SidePanelTabEnum)}
              />
              <hr className="border-secondary-accent" />
            </div>
            {data && renderTabContent()}
          </>
        )}
      </div>
    </SidePanel>
  );
};

export default ContactSidePanel;
