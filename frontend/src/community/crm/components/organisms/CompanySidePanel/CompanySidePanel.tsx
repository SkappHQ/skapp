import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const CompanySidePanel = ({ isOpen, onClose }: SidePanelProps) => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");

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
    />
  );
};

export default CompanySidePanel;
