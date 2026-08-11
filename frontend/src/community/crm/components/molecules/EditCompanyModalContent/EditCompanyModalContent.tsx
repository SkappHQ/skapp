import { useFormik } from "formik";
import React, { useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { formatPhoneNumber } from "~community/common/utils/commonUtil";
import { useEditCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompany,
  CrmCompanyFormTypes,
  EditCompanyPayload
} from "~community/crm/types/CommonTypes";
import { getCompanyFormInitialValues } from "~community/crm/utils/companyUtil";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";

const EditCompanyModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "companies", "companyModal");
  const defaultCountryCode = useGetDefaultCountryCode();

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

  const initialValues = useMemo(
    () => getCompanyFormInitialValues(defaultCountryCode, selectedCompany),
    [selectedCompany, defaultCountryCode]
  );

  const formik = useFormik<CrmCompanyFormTypes>({
    initialValues,
    onSubmit: (values) => submitEditCompany(values),
    validationSchema: addCompanyValidations(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = (data: CrmCompany) => {
    setSubmitting(false);
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
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
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
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: formatPhoneNumber(
        values.countryCode,
        values.contactNumber.trim()
      )
    };

    editCompany(payload);
  };

  return (
    <CompanyModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
      originalName={selectedCompany?.name}
      onCancel={handleCloseModal}
    />
  );
};

export default EditCompanyModalContent;
