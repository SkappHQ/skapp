import {
  DeleteButtonIcon,
  EditIcon,
  KebabMenu,
  SidePanel
} from "@rootcodelabs/skapp-ui";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const CompanySidePanel: React.FC<{
  company: CrmCompanyMetricsType | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");

  const { setIsCompanyModalOpen, setCompanyModalType } = useCrmStore(
    (store) => ({
      setIsCompanyModalOpen: store.setIsCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType
    })
  );

  const handleOpenDeleteCompanyModal = () => {
    setCompanyModalType(CrmModalTypes.DELETE_COMPANY_MODAL);
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditCompanyModal = () => {
    setCompanyModalType(CrmModalTypes.EDIT_COMPANY_MODAL);
    setIsCompanyModalOpen(true);
  };

  const menuItems = [
    {
      id: "edit",
      label: translateText(["editCompany"]),
      icon: { start: <EditIcon width="16px" height="16px" /> },
      onClick: handleOpenEditCompanyModal
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
      onClick: handleOpenDeleteCompanyModal
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
