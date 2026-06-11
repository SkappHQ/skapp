import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteCompany } from "~community/crm/api/CompanyApi";
import { useCrmStore } from "~community/crm/store/store";

const DeleteCompanyModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const {
    selectedCompany,
    setSelectedCompany,
    setIsCompanySidePanelOpen,
    setIsCompanyModalOpen
  } = useCrmStore((store) => ({
    selectedCompany: store.selectedCompany,
    setSelectedCompany: store.setSelectedCompany,
    setIsCompanySidePanelOpen: store.setIsCompanySidePanelOpen,
    setIsCompanyModalOpen: store.setIsCompanyModalOpen
  }));

  const translateText = useTranslator(
    "crmModule",
    "companies",
    "deleteCompanyModal"
  );

  const handleCloseModal = () => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages","successTitle"]),
      description: translateText(["toastMessages","successDescription"], {
        companyName: selectedCompany?.name
      })
    });

    handleCloseModal();
    setIsCompanySidePanelOpen(false);
    setSelectedCompany(null);
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages","errorTitle"]),
      description: translateText(["toastMessages","errorDescription"])
    });
  };

  const { mutate: deleteCompany, isPending } = useDeleteCompany(
    handleSuccess,
    handleError
  );

  const handleDeleteCompany = () => {
    if (selectedCompany?.id === undefined) return;
    deleteCompany(selectedCompany.id);
  };

  return (
    <div className="flex flex-col">
      <div>
        {translateText(["description"], { companyName: selectedCompany?.name })}
      </div>
      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="error"
          type="button"
          icon={
            <DeleteButtonIcon
              height="12px"
              width="9.33px"
              fill="var(--color-semantic-red-text)"
            />
          }
          iconPosition="end"
          onClick={handleDeleteCompany}
          disabled={isPending}
          aria-label={translateText(["ariaLabels", "confirm"])}
        >
          {translateText(["buttons", "confirm"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DeleteCompanyModalContent;
