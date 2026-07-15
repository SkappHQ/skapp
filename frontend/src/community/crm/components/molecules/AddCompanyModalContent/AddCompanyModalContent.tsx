import React from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateNewCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompanyAddFormTypes,
  CrmCompanyCreatePayload
} from "~community/crm/types/CommonTypes";

const AddCompanyModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "companies",
    "addCompanyModal"
  );

  const { setIsCompanyModalOpen } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen
  }));

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = () => {
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const initialValues: CrmCompanyAddFormTypes = {
    name: "",
    industry: CrmIndustryEnum.NONE,
    website: null,
    address: null,
    contactNumber: null
  };

  const { mutate: createNewCompany, isPending } = useCreateNewCompany(
    handleSuccess,
    handleError
  );

  const createCompany = (values: CrmCompanyAddFormTypes) => {
    const payload: CrmCompanyCreatePayload = {
      name: values.name.trim(),
      industry: values.industry,
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: values.contactNumber?.trim() || null
    };

    createNewCompany(payload);
  };

  return (
    <CompanyModalForm
      translateText={translateText}
      initialValues={initialValues}
      isPending={isPending}
      onSubmit={createCompany}
      onCancel={handleCloseModal}
    />
  );
};

export default AddCompanyModalContent;
