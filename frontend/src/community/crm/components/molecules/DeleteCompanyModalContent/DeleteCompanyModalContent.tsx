import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCrmStore } from "~community/crm/store/store";

const DeleteCompanyModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const { selectedCompany } = useCrmStore((store) => ({
    selectedCompany: store.selectedCompany
  }));

  const { setIsCompanyModalOpen } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen
  }));

  const translateText = useTranslator(
    "crmModule",
    "companies",
    "deleteCompanyModal"
  );

  const translateToasts = useTranslator(
    "crmModule",
    "companies",
    "deleteCompanyToastMessages"
  );

  const handleSuccess = () => {
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateToasts(["successTitle"]),
      description: translateToasts(["successDescription"], {
        companyName: selectedCompany?.name
      })
    });
  };

  const handleCloseModal = () => {
    setIsCompanyModalOpen(false);
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
          icon={
            <DeleteButtonIcon
              height="12px"
              width="9.33px"
              fill="var(--color-semantic-red-text)"
            />
          }
          iconPosition="end"
          onClick={handleSuccess}
          aria-label={translateText(["ariaLabels", "confirm"])}
        >
          {translateText(["buttons", "confirm"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DeleteCompanyModalContent;
