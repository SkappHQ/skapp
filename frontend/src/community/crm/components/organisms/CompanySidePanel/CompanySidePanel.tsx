import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel,
  SidePanelProps,
  TabItem,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelCompanyHeader from "~community/crm/components/molecules/SidePanelCompanyHeader/SidePanelCompanyHeader";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import { SidePanelTabEnum } from "~community/crm/enums/TabTypesEnum";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const CompanySidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");

  const [activeTab, setActiveTab] = useState<SidePanelTabEnum>(
    SidePanelTabEnum.TASKS
  );

  const { setIsCompanyModalOpen, setCompanyModalType, selectedCompany } =
    useCrmStore((store) => ({
      setIsCompanyModalOpen: store.setIsCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType,
      selectedCompany: store.selectedCompany
    }));

  const openCompanyModal = (type: CrmModalTypes) => {
    setCompanyModalType(type);
    setIsCompanyModalOpen(true);
  };

  const menuItems = [
    {
      id: "edit",
      label: translateText(["editCompany"]),
      icon: { start: <EditIcon width="16px" height="16px" /> },
      onClick: () => openCompanyModal(CrmModalTypes.EDIT_COMPANY_MODAL)
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
      activeBehavior: "hover:bg-semantic-red-background text-semantic-red-text",
      onClick: () => openCompanyModal(CrmModalTypes.DELETE_COMPANY_MODAL)
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case SidePanelTabEnum.DEALS:
        // Pass the real API data to SidePanelDealSection when available
        return <SidePanelDealSection deals={[]} />;
      case SidePanelTabEnum.TASKS:
        // Implement SidePanelTaskSection here
        return null;
      case SidePanelTabEnum.CONTACTS:
        // Implement SidePanelContactSection here
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
    },
    {
      id: SidePanelTabEnum.CONTACTS,
      label: translateText(["tabs", "contacts"])
    }
  ];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick
      header={
        <h2 className="h1 leading-[24px] tracking-[0.07px] text-black">
          {selectedCompany?.name}
        </h2>
      }
      headerActions={
        <KebabMenu
          id={"company-actions"}
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
      {selectedCompany && (
        <div className="flex flex-col pb-4 gap-4">
          <SidePanelCompanyHeader company={selectedCompany} />

          <div className="flex flex-col pt-2 w-full">
            <Tabs
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as SidePanelTabEnum)}
            />
          </div>
          <hr className="border-secondary-accent" />
          {renderTabContent()}
        </div>
      )}
    </SidePanel>
  );
};

export default CompanySidePanel;
