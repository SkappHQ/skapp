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
import {
  CompanySidePanelTabEnum,
  ContactSidePanelTabEnum
} from "~community/crm/enums/TabTypesEnum";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import SidePanelDealSection from "../../molecules/SidePanelDealSection/SidePanelDealSection";

const CompanySidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");

  const [activeTab, setActiveTab] = useState<CompanySidePanelTabEnum>(
    CompanySidePanelTabEnum.TASKS
  );

  const { setIsCompanyModalOpen, setCompanyModalType } = useCrmStore(
    (store) => ({
      setIsCompanyModalOpen: store.setIsCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType
    })
  );

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
      case CompanySidePanelTabEnum.DEALS:
        return <SidePanelDealSection deals={[]} />;
      case CompanySidePanelTabEnum.TASKS:
        // Implement SidePanelTaskSection here
        return null;
      case CompanySidePanelTabEnum.CONTACTS:
        // Implement SidePanelContactSection here
        return null;
      default:
        return null;
    }
  };

  const tabs: TabItem[] = [
    {
      id: CompanySidePanelTabEnum.TASKS,
      label: translateText(["tabs", "tasks"])
    },
    {
      id: CompanySidePanelTabEnum.DEALS,
      label: translateText(["tabs", "deals"])
    },
    {
      id: CompanySidePanelTabEnum.CONTACTS,
      label: translateText(["tabs", "contacts"])
    }
  ];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
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
      <div className="flex flex-col pb-4 gap-[16px]">
        {/*Add company infor section here, similar to ContactSidePanel*/}
        <div className="flex flex-col pt-2 w-full">
          <Tabs
            tabs={tabs}
            activeTabId={activeTab}
            onTabChange={(tabId) =>
              setActiveTab(tabId as CompanySidePanelTabEnum)
            }
          />
        </div>
        <hr className="border-secondary-accent" />
        {renderTabContent()}
      </div>
    </SidePanel>
  );
};

export default CompanySidePanel;
