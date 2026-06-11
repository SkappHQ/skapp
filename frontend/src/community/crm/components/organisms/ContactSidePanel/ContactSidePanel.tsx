import { SidePanel, TabItem, Tabs } from "@rootcodelabs/skapp-ui";
import { useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { formatISODateWithSuffix } from "~community/common/utils/dateTimeUtils";
import { useGetContactById } from "~community/crm/api/ContactApi";
import { useCrmStore } from "~community/crm/store/store";

import SidePanelContactHeader from "../../molecules/SidePanelContactHeader/SidePanelContactHeader";
import SidePanelDealSection from "../../molecules/SidePanelDealSection/SidePanelDealSection";

type TabId = "tasks" | "deals";

const ContactSidePanel = () => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );
  const { setToastMessage } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("tasks");

  const {
    isContactSidePanelOpen,
    setIsContactSidePanelOpen,
    setSelectedContact,
    selectedContact
  } = useCrmStore((store) => ({
    isContactSidePanelOpen: store.isContactSidePanelOpen,
    setIsContactSidePanelOpen: store.setIsContactSidePanelOpen,
    setSelectedContact: store.setSelectedContact,
    selectedContact: store.selectedContact
  }));

  const { data: contact, isLoading } = useGetContactById(
    selectedContact?.id ?? 0
  );

  useEffect(() => {
    if (
      isContactSidePanelOpen &&
      !selectedContact?.id &&
      !isLoading &&
      !contact
    ) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["errors", "contactNotFoundTitle"]),
        description: translateText(["errors", "contactNotFoundDescription"])
      });

      setIsContactSidePanelOpen(false);
      setSelectedContact(null);
    }
  }, [isContactSidePanelOpen, selectedContact, isLoading, contact]);

  const handleClose = (): void => {
    setIsContactSidePanelOpen(false);
    setSelectedContact(null);
  };

  const handleCompanyClick = () => {
    //TODO: Implement company Id page and link it here
  };

  const tabs: TabItem[] = [
    { id: "tasks", label: translateText(["tabs", "tasks"]) },
    { id: "deals", label: translateText(["tabs", "deals"]) }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabId);
  };

  return (
    <SidePanel
      isOpen={isContactSidePanelOpen}
      onClose={handleClose}
      closeOnBackdropClick
      width="lg"
      header={
        <div className=" flex flex-col gap-2 pl-2">
          <h2 className="h1 leading-[24px] tracking-[0.07px] text-black">
            {contact?.name}
          </h2>
          <p className="body2 leading-[24px] text-secondary-text">
            {`${translateText(["lastUpdated"])} : ${formatISODateWithSuffix(contact?.lastModifiedDate ?? "")}`}
          </p>
        </div>
      }
    >
      <div className="flex flex-col pb-4 gap-[16px]">
        <SidePanelContactHeader
          contact={contact ?? undefined}
          onCompanyClick={handleCompanyClick}
        />
        <div className="flex flex-col pt-2 w-full">
          <Tabs
            tabs={tabs}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
        {activeTab === "deals" && (
          <SidePanelDealSection deals={contact?.deals ?? []} />
        )}
        {activeTab === "tasks" && (
          // TODO: Implement SidePanelTaskSection here
          <></>
        )}
      </div>
    </SidePanel>
  );
};

export default ContactSidePanel;
