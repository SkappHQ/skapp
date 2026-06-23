import {
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
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import { SidePanelTabEnum } from "~community/crm/enums/TabTypesEnum";
import { useCrmStore } from "~community/crm/store/store";

import ContactSidePanelSkeleton from "./ContactSidePanelSkeleton";

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

  const { setIsCrmSidePanelOpen, setSelectedContactId, selectedContactId } =
    useCrmStore((store) => ({
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
      setSelectedContactId: store.setSelectedContactId,
      selectedContactId: store.selectedContactId
    }));

  const handleContactLoadError = (): void => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["errors", "contactNotFoundTitle"]),
      description: translateText(["errors", "contactNotFoundDescription"])
    });
    setIsCrmSidePanelOpen(false);
    setSelectedContactId(null);
  };

  const {
    data: contact,
    isError,
    isLoading
  } = useGetContactById(selectedContactId ?? 0, isOpen && !!selectedContactId);

  useEffect(() => {
    if (isError) handleContactLoadError();
  }, [isError]);

  const handleClose = (): void => {
    setSelectedContactId(null);
    setIsCrmSidePanelOpen(false);
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
        isLoading ? (
          <SidePanelHeaderSkeleton isShowLastUpdate={true} />
        ) : (
          <SidePanelContactHeader
            name={contact?.name}
            lastModifiedDate={contact?.lastModifiedDate}
          />
        )
      }
      headerActions={isLoading ? <SidePanelHeaderActionsSkeleton /> : <></>}
    >
      <div className="flex flex-col pb-4 gap-4">
        {isLoading && !contact ? (
          <ContactSidePanelSkeleton />
        ) : (
          <>
            <SidePanelContactInfo contact={contact} />

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

export default ContactSidePanel;
