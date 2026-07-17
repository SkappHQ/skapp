import React from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompany,
  CrmCompanyFormTypes,
  EditCompanyPayload
} from "~community/crm/types/CommonTypes";

const EditCompanyModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "companies", "companyModal");

  const {
    setIsCompanyModalOpen,
    selectedCompanyId,
    getCompanyById,
    updateCompany
  } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen,
    selectedCompanyId: store.selectedCompanyId,
    getCompanyById: store.getCompanyById,
    updateCompany: store.updateCompany
  }));

  const selectedCompany = getCompanyById(selectedCompanyId!);

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = (data: CrmCompany) => {
    updateCompany(data);
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "edit", "successTitle"]),
      description: translateText([
        "toastMessages",
        "edit",
        "successDescription"
      ])
    });
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "edit", "errorTitle"]),
      description: translateText(["toastMessages", "edit", "errorDescription"])
    });
  };

  const { mutate: editCompany, isPending } = useEditCompany(
    handleSuccess,
    handleError
  );

  const submitEditCompany = (values: CrmCompanyFormTypes) => {
    if (!selectedCompany) return;

    const payload: EditCompanyPayload = {
      id: selectedCompany.id,
      name: values.name.trim(),
      industry: values.industry,
      website: values.website.trim() || null,
      address: values.address.trim() || null,
      contactNumber: values.contactNumber.trim() || null
    };

    editCompany(payload);
  };

  return (
    <CompanyModalForm
      mode="edit"
      isPending={isPending}
      onSubmit={submitEditCompany}
      onCancel={handleCloseModal}
    />
  );
};

export default EditCompanyModalContent;
