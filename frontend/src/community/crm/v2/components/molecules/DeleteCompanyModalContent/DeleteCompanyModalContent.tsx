import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteCompany } from "~community/crm/v2/api/CompanyApi";
import CrmDeleteModalContent from "~community/crm/v2/components/molecules/CrmDeleteModalContent/CrmDeleteModalContent";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  getSelectedCompany,
  removeCompany
} from "~community/crm/v2/utils/companyUtil";

const DeleteCompanyModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModuleV2");
  const translateAria = useTranslator("crmAriaV2");

  const {
    companies,
    companyIds,
    selectedCompanyId,
    setCompanies,
    setCompanyIds,
    setSelectedCompanyId,
    closeCrmSidePanel,
    setIsCompanyModalOpen
  } = useCrmStoreV2(
    useShallow((store) => ({
      companies: store.companies,
      companyIds: store.companyIds,
      selectedCompanyId: store.selectedCompanyId,
      setCompanies: store.setCompanies,
      setCompanyIds: store.setCompanyIds,
      setSelectedCompanyId: store.setSelectedCompanyId,
      closeCrmSidePanel: store.closeCrmSidePanel,
      setIsCompanyModalOpen: store.setIsCompanyModalOpen
    }))
  );

  const selectedCompany = getSelectedCompany(companies, selectedCompanyId);

  const handleCloseModal = () => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = () => {
    if (selectedCompanyId !== null) {
      const remaining = removeCompany(companies, companyIds, selectedCompanyId);

      setCompanies(remaining.companies);
      setCompanyIds(remaining.companyIds);
    }

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "companies",
        "deleteModal",
        "toastMessages",
        "successTitle"
      ]),
      description: translateText(
        ["companies", "deleteModal", "toastMessages", "successDescription"],
        {
          companyName: selectedCompany?.name
        }
      )
    });

    handleCloseModal();
    closeCrmSidePanel();
    setSelectedCompanyId(null);
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "companies",
        "deleteModal",
        "toastMessages",
        "errorTitle"
      ]),
      description: translateText([
        "companies",
        "deleteModal",
        "toastMessages",
        "errorDescription"
      ])
    });
  };

  const { mutate: deleteCompany, isPending } = useDeleteCompany(
    handleSuccess,
    handleError
  );

  const handleDeleteCompany = () => {
    if (selectedCompanyId === null) return;

    deleteCompany(selectedCompanyId);
  };

  return (
    <CrmDeleteModalContent
      description={translateText(["companies", "deleteModal", "description"], {
        companyName: selectedCompany?.name
      })}
      isPending={isPending}
      confirmLabel={translateText([
        "companies",
        "deleteModal",
        "buttons",
        "confirm"
      ])}
      cancelLabel={translateText([
        "companies",
        "deleteModal",
        "buttons",
        "cancel"
      ])}
      confirmAriaLabel={translateAria(["companies", "deleteModal", "confirm"])}
      cancelAriaLabel={translateAria(["companies", "deleteModal", "cancel"])}
      onConfirm={handleDeleteCompany}
      onClose={handleCloseModal}
    />
  );
};

export default DeleteCompanyModalContent;
