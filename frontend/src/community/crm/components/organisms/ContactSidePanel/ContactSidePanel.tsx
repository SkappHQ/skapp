import {
  SidePanel,
  SidePanelProps,
  TabItem,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { useEffect, useState } from "react";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetContactById } from "~community/crm/api/ContactApi";
import SidePanelContactHeader from "~community/crm/components/molecules/SidePanelContactHeader/SidePanelContactHeader";
import SidePanelContactInfo from "~community/crm/components/molecules/SidePanelContactInfo/SidePanelContactInfo";
import { ContactSidePanelTabEnum } from "~community/crm/enums/TabTypesEnum";
import { useCrmStore } from "~community/crm/store/store";

import SidePanelDealSection from "../../molecules/SidePanelDealSection/SidePanelDealSection";

const ContactSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );
  const { setToastMessage } = useToast();

  const [activeTab, setActiveTab] = useState<ContactSidePanelTabEnum>(
    ContactSidePanelTabEnum.TASKS
  );

  const { setIsCrmSidePanelOpen, setSelectedContact, selectedContact } =
    useCrmStore((store) => ({
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
      setSelectedContact: store.setSelectedContact,
      selectedContact: store.selectedContact
    }));

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
    selectedContact!.id,
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
      case ContactSidePanelTabEnum.DEALS:
        return <SidePanelDealSection deals={contact?.deals ?? []} />;
      case ContactSidePanelTabEnum.TASKS:
        // TODO: Implement SidePanelTaskSection here
        return null;
      default:
        return null;
    }
  };

  const tabs: TabItem[] = [
    {
      id: ContactSidePanelTabEnum.TASKS,
      label: translateText(["tabs", "tasks"])
    },
    {
      id: ContactSidePanelTabEnum.DEALS,
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
          name={contact.name}
          lastModifiedDate={contact.lastModifiedDate}
        />
      }
    >
      <div className="flex flex-col pb-4 gap-[16px]">
        <SidePanelContactInfo
          contact={contact}
          onCompanyClick={handleCompanyClick}
        />

        <div className="flex flex-col pt-2 w-full">
          <Tabs
            tabs={tabs}
            activeTabId={activeTab}
            onTabChange={(tabId) =>
              setActiveTab(tabId as ContactSidePanelTabEnum)
            }
          />
        </div>
        {renderTabContent()}
      </div>
    </SidePanel>
  );
};

export default ContactSidePanel;
