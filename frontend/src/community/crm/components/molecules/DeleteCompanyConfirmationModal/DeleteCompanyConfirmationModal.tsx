import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";

const DeleteCompanyConfirmationModal = () => {
  const translateText = useTranslator("crmModule", "companies");
  const { selectedCompany, setIsCompanyModalOpen } = useCrmStore();

  const handleDelete = () => {
    // TODO: call delete API
    setIsCompanyModalOpen(false);
  };

  const handleCancel = () => {
    setIsCompanyModalOpen(false);
  };

  return (
    <UserPromptModal
      description={
        <span className="body2 text-secondary-text">
          {selectedCompany?.name
            ? translateText(["deleteCompanyModal", "description"], {
                companyName: selectedCompany.name
              })
            : ""}
        </span>
      }
      primaryBtn={{
        label: translateText(["deleteCompanyModal", "deleteButton"]),
        onClick: handleDelete,
        endIcon: IconName.DELETE_BUTTON_ICON,
        endIconFill: "currentColor",
        buttonStyle: ButtonStyle.ERROR
      }}
      secondaryBtn={{
        label: translateText(["deleteCompanyModal", "cancelButton"]),
        onClick: handleCancel,
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default DeleteCompanyConfirmationModal;

