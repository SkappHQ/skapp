import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useDeleteCompany } from "~community/crm/api/CompanyApi";
import { useCrmStore } from "~community/crm/store/store";

const DeleteCompanyConfirmationModal = () => {
  const translateText = useTranslator("crmModule", "companies");

  const { selectedCompany, setIsCompanyModalOpen, setIsCompanyDetailDrawerOpen } = useCrmStore();
  const { mutate: deleteCompany } = useDeleteCompany(
    () => {
      handleClose();
      setIsCompanyDetailDrawerOpen(false);
    },
    (messageKey) => {
      console.error("Error deleting company:", messageKey);
    }
  );

  const handleClose = () => {
    setIsCompanyModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedCompany) {
      deleteCompany(selectedCompany.id);
    }
  };

  return (
    <UserPromptModal
      description={translateText(["deleteCompanyModal", "description"], { companyName: selectedCompany?.name ?? "this company" })}
      primaryBtn={{
        label: translateText(["deleteCompanyModal", "buttons", "confirmDelete"]),
        onClick: handleDelete,
        endIcon: IconName.DELETE_BUTTON_ICON,
        buttonStyle: ButtonStyle.ERROR
      }}
      secondaryBtn={{
        label: translateText(["deleteCompanyModal", "buttons", "cancelDelete"]),
        onClick: handleClose,
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default DeleteCompanyConfirmationModal;
