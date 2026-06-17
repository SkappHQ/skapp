import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  MenuItemProps,
  SidePanel,
  SidePanelProps,
  TabItem,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetContactById } from "~community/crm/api/ContactApi";
import SidePanelContactHeader from "~community/crm/components/molecules/SidePanelContactHeader/SidePanelContactHeader";
import SidePanelContactInfo from "~community/crm/components/molecules/SidePanelContactInfo/SidePanelContactInfo";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import { SidePanelTabEnum } from "~community/crm/enums/TabTypesEnum";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const ContactSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
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
    setIsCrmSidePanelOpen,
    setSelectedContact,
    selectedContact,
    setContactModalType,
    setIsAddContactModalOpen
  } = useCrmStore((store) => ({
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setSelectedContact: store.setSelectedContact,
    selectedContact: store.selectedContact,

    setContactModalType: store.setContactModalType,
    setIsAddContactModalOpen: store.setIsAddContactModalOpen
  }));

  const openContactModal = (type: CrmModalTypes): void => {
    setContactModalType(type);
    setIsAddContactModalOpen(true);
  };

  const menuItems: MenuItemProps[] = [
    {
      id: "edit",
      label: translateText(["editContact"]),
      icon: { start: <EditIcon width="16px" height="16px" /> },
      onClick: () => {} //Add edit contact functionality here
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
        openContactModal(CrmModalTypes.DELETE_CONTACT_MODAL);
      },
      activeBehavior: "hover:bg-semantic-red-background text-semantic-red-text"
    }
  ];

  const handleContactLoadError = (): void => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["errors", "contactNotFoundTitle"]),
      description: translateText(["errors", "contactNotFoundDescription"])
    });
    setIsCrmSidePanelOpen(false);
    setSelectedContact(null);
  };

  const { data: contact, isError } = useGetContactById(
    selectedContact?.id ?? 0,
    isOpen && !!selectedContact?.id
  );

  useEffect(() => {
    if (isError) handleContactLoadError();
  }, [isError]);

  const handleClose = (): void => {
    setSelectedContact(null);
    setIsCrmSidePanelOpen(false);
  };

  const handleCompanyClick = () => {
    //TODO: Implement company Id page and link it here
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case SidePanelTabEnum.DEALS:
        return <SidePanelDealSection deals={contact?.deals ?? []} />;
      case SidePanelTabEnum.TASKS:
        // TODO: Implement SidePanelTaskSection here
        return null;
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
        <SidePanelContactHeader
          name={contact?.name}
          lastModifiedDate={contact?.lastModifiedDate}
        />
      }
      headerActions={
        <KebabMenu
          id={"contact-actions"}
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
      <div className="flex flex-col pb-4 gap-4">
        {contact && (
          <SidePanelContactInfo
            contact={contact}
            onCompanyClick={handleCompanyClick}
          />
        )}

        <div className="flex flex-col pt-2 w-full">
          <Tabs
            tabs={tabs}
            activeTabId={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as SidePanelTabEnum)}
          />
          <hr className="border-secondary-accent" />
        </div>
        {renderTabContent()}
      </div>
    </SidePanel>
  );
};

export default ContactSidePanel;
