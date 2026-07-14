import React from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompany,
  CrmCompanyEditFormTypes,
  EditCompanyPayload
} from "~community/crm/types/CommonTypes";

const EditCompanyModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "companies",
    "editCompanyModal"
  );

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

  const initialValues: CrmCompanyEditFormTypes = {
    name: selectedCompany?.name || "",
    industry: selectedCompany?.industry || CrmIndustryEnum.NONE,
    website: selectedCompany?.website || null,
    address: selectedCompany?.address || null,
    contactNumber: selectedCompany?.contactNumber || null
  };

  const { mutate: editCompany, isPending } = useEditCompany(
    (data: CrmCompany) => {
      updateCompany(data);
      handleCloseModal();
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toastMessages", "successTitle"]),
        description: translateText(["toastMessages", "successDescription"])
      });
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toastMessages", "errorTitle"]),
        description: translateText(["toastMessages", "errorDescription"])
      });
    }
  );

  const submitEditCompany = (values: CrmCompanyEditFormTypes) => {
    if (!selectedCompany) return;

    const payload: EditCompanyPayload = {
      id: selectedCompany.id,
      name: values.name.trim(),
      industry: values.industry,
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: values.contactNumber?.trim() || null
    };

    editCompany(payload);
  };

  return (
    <CompanyModalForm
      translateText={translateText}
      initialValues={initialValues}
      isPending={isPending}
      onSubmit={submitEditCompany}
      onCancel={handleCloseModal}
      originalName={selectedCompany?.name}
    />
  );
};

export default EditCompanyModalContent;
