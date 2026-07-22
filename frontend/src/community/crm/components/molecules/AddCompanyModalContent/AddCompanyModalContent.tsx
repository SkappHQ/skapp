import { useFormik } from "formik";
import React from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateNewCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompanyCreatePayload,
  CrmCompanyFormTypes
} from "~community/crm/types/CommonTypes";
import { getCompanyFormInitialValues } from "~community/crm/utils/companyUtil";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";

const AddCompanyModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "companies", "companyModal");

  const { setIsCompanyModalOpen } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen
  }));

  const formik = useFormik<CrmCompanyFormTypes>({
    initialValues: getCompanyFormInitialValues(),
    onSubmit: (values) => createCompany(values),
    validationSchema: addCompanyValidations(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = () => {
    setSubmitting(false);
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "add", "successTitle"]),
      description: translateText(["toastMessages", "add", "successDescription"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "add", "errorDescription"])
    });
  };

  const { mutate: createNewCompany, isPending } = useCreateNewCompany(
    handleSuccess,
    handleError
  );

  const createCompany = (values: CrmCompanyFormTypes) => {
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
      formik={formik}
      isPending={isPending}
      translateText={translateText}
      onCancel={handleCloseModal}
    />
  );
};

export default AddCompanyModalContent;
