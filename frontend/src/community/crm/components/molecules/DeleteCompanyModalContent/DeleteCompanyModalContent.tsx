import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteCompany } from "~community/crm/api/CompanyApi";
import CrmDeleteModalContent from "~community/crm/components/molecules/CrmDeleteModalContent/CrmDeleteModalContent";
import { useCrmStore } from "~community/crm/store/store";

const DeleteCompanyModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const {
    selectedCompanyId,
    getCompanyById,
    setSelectedCompanyId,
    closeCrmSidePanel,
    setIsCompanyModalOpen,
    removeCompany
  } = useCrmStore((store) => ({
    selectedCompanyId: store.selectedCompanyId,
    getCompanyById: store.getCompanyById,
    setSelectedCompanyId: store.setSelectedCompanyId,
    closeCrmSidePanel: store.closeCrmSidePanel,
    setIsCompanyModalOpen: store.setIsCompanyModalOpen,
    removeCompany: store.removeCompany
  }));

  const selectedCompany = getCompanyById(selectedCompanyId!);

  const translateText = useTranslator(
    "crmModule",
    "companies",
    "deleteCompanyModal"
  );

  const handleCloseModal = () => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = () => {
    if (selectedCompanyId) removeCompany(selectedCompanyId);

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"], {
        companyName: selectedCompany?.name
      })
    });

    handleCloseModal();
    closeCrmSidePanel();
    setSelectedCompanyId(null);
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: deleteCompany, isPending } = useDeleteCompany(
    handleSuccess,
    handleError
  );

  const handleDeleteCompany = () => {
    deleteCompany(selectedCompany.id);
  };

  return (
    <CrmDeleteModalContent
      description={translateText(["description"], {
        companyName: selectedCompany?.name
      })}
      isPending={isPending}
      confirmLabel={translateText(["buttons", "confirm"])}
      cancelLabel={translateText(["buttons", "cancel"])}
      onConfirm={handleDeleteCompany}
      onClose={handleCloseModal}
    />
  );
};

export default DeleteCompanyModalContent;
