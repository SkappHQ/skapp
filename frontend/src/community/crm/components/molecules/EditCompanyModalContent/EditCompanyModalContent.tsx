import { useFormik } from "formik";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyEntity } from "~community/crm/types/CrmCommonTypes";
import {
  addNewIndustryToRecord,
  getChangedCompanyFields,
  getSelectedCompany,
  updateCompany
} from "~community/crm/utils/companyUtil";
import { getCompanyValidationSchema } from "~community/crm/utils/companyValidations";

const EditCompanyModalContent: FC = () => {
  const { setToastMessage } = useToast();
  const { isCrmSalesManager } = useSessionData();

  const translateText = useTranslator("crmModule");

  const {
    companies,
    industries,
    selectedCompanyId,
    setCompanies,
    setIndustries,
    setIsCompanyModalOpen
  } = useCrmStore(
    useShallow((store) => ({
      companies: store.companies,
      industries: store.industries,
      selectedCompanyId: store.selectedCompanyId,
      setCompanies: store.setCompanies,
      setIndustries: store.setIndustries,
      setIsCompanyModalOpen: store.setIsCompanyModalOpen
    }))
  );

  const selectedCompany = getSelectedCompany(companies, selectedCompanyId);

  const initialValues = useMemo(
    () => ({
      name: selectedCompany?.name ?? "",
      industryId: selectedCompany?.industryId ?? null,
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

  const { setSubmitting, values } = formik;

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = (updatedCompany: CrmCompanyEntity) => {
    setSubmitting(false);

    if (selectedCompanyId !== null) {
      setCompanies(updateCompany(companies, selectedCompanyId, updatedCompany));
    }

    if (updatedCompany.industryId != null && values.industryName) {
      setIndustries(
        addNewIndustryToRecord(industries, {
          id: updatedCompany.industryId,
          name: values.industryName
        })
      );
    }

    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "companies",
        "modal",
        "toastMessages",
        "editSuccessTitle"
      ]),
      description: translateText([
        "companies",
        "modal",
        "toastMessages",
        "editSuccessDescription"
      ])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "companies",
        "modal",
        "toastMessages",
        "errorTitle"
      ]),
      description: translateText([
        "companies",
        "modal",
        "toastMessages",
        "editErrorDescription"
      ])
    });
  };

  const { mutate: editCompany, isPending } = useEditCompany(
    handleSuccess,
    handleError
  );

  const submitEditCompany = (values: CrmCompanyEntity) => {
    if (selectedCompanyId === null) return;

    const changedFields = getChangedCompanyFields(initialValues, {
      name: values.name?.trim(),
      industryId: values.industryId,
      industryName: values.industryName?.trim(),
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
      originalName={selectedCompany?.name}
      canAddNewIndustry={isCrmSalesManager}
      onCancel={handleCloseModal}
    />
  );
};

export default EditCompanyModalContent;
