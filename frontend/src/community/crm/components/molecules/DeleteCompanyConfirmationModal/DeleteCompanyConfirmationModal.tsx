import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/crmStore";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const DeleteCompanyConfirmationModal = () => {
  const { selectedCompany, setCompanyModalType } = useCrmStore();

  const handleDelete = () => {
    // TODO: call delete API
    setCompanyModalType(CrmModalTypes.NONE);
  };

  const handleCancel = () => {
    setCompanyModalType(CrmModalTypes.NONE);
  };

  return (
    <UserPromptModal
      description={`Are you sure you want to delete '${selectedCompany?.name ?? ""}'? This will permanently remove this company along with all associated deals and tasks. This action cannot be undone.`}
      primaryBtn={{
        label: "Delete",
        onClick: handleDelete,
        endIcon: IconName.DELETE_BUTTON_ICON,
        buttonStyle: ButtonStyle.ERROR
      }}
      secondaryBtn={{
        label: "Cancel",
        onClick: handleCancel,
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default DeleteCompanyConfirmationModal;
