import { useFormik } from "formik";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditCompany } from "~community/crm/v2/api/CompanyApi";
import CompanyModalForm from "~community/crm/v2/components/molecules/CompanyModalForm/CompanyModalForm";
import { CrmIndustryEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getCompanyById,
  getCompanyFieldDiff,
  updateCompany
} from "~community/crm/v2/utils/companyUtil";
import { getCompanyValidationSchema } from "~community/crm/v2/utils/companyValidations";

const EditCompanyModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "companies", "companyModal");

  const { companies, selectedCompanyId, setCompanies, setIsCompanyModalOpen } =
    useCrmStoreV2(
      useShallow((store) => ({
        companies: store.companies,
        selectedCompanyId: store.selectedCompanyId,
        setCompanies: store.setCompanies,
        setIsCompanyModalOpen: store.setIsCompanyModalOpen
      }))
    );

  const selectedCompany =
    selectedCompanyId !== null
      ? getCompanyById(companies, selectedCompanyId)
      : undefined;

  const initialValues = useMemo(
    () => ({
      name: selectedCompany?.name ?? "",
      industry: selectedCompany?.industry ?? CrmIndustryEnum.NONE,
      website: selectedCompany?.website ?? "",
      address: selectedCompany?.address ?? "",
      contactNumber: selectedCompany?.contactNumber ?? ""
    }),
    [selectedCompany]
  );

  const formik = useFormik<CrmCompanyEntity>({
    initialValues,
    onSubmit: (values) => submitEditCompany(values),
    validationSchema: getCompanyValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = (updatedCompany: CrmCompanyEntity) => {
    setSubmitting(false);

    if (selectedCompanyId !== null) {
      setCompanies(updateCompany(companies, selectedCompanyId, updatedCompany));
    }

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

  const submitEditCompany = (values: CrmCompanyEntity) => {
    if (selectedCompanyId === null) return;

    const changedFields = getCompanyFieldDiff(initialValues, {
      name: values.name?.trim(),
      industry: values.industry,
      website: values.website?.trim(),
      address: values.address?.trim(),
      contactNumber: values.contactNumber?.trim()
    });

    if (Object.keys(changedFields).length === 0) {
      handleCloseModal();
      return;
    }

    editCompany({ id: selectedCompanyId, ...changedFields });
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
