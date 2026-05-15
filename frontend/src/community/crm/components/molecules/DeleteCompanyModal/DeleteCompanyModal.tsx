import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { IconName } from "~community/common/types/IconTypes";
import { useDeleteCompany } from "~community/crm/api/CompanyApi";
import { useCrmStore } from "~community/crm/store/store";

const DeleteCompanyModal = () => {
  const {
    selectedCompany,
    setSelectedCompany,
    setIsDeleteCompanyModalOpen,
    setIsCompanyDetailDrawerOpen
  } = useCrmStore();

  const handleClose = () => {
    setIsDeleteCompanyModalOpen(false);
  };

  const { mutate: deleteCompany, isPending } = useDeleteCompany(
    () => {
      setSelectedCompany(null);
      setIsCompanyDetailDrawerOpen(false);
      handleClose();
    },
    (error) => {
      console.error("Failed to delete company:", error);
    }
  );

  const handleDelete = () => {
    if (selectedCompany?.id) {
      deleteCompany(selectedCompany.id);
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  return (
    <UserPromptModal
      description={`Are you sure you want to delete '${selectedCompany?.name ?? "this company"}'? This will permanently remove this company along with all associated deals and tasks. This action cannot be undone.`}
      primaryBtn={{
        label: "Delete",
        onClick: handleDelete,
        endIcon: IconName.DELETE_BUTTON_ICON,
        buttonStyle: ButtonStyle.ERROR,
        isDisabled: isPending
      }}
      secondaryBtn={{
        label: "Cancel",
        onClick: handleCancel,
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default DeleteCompanyModal;
