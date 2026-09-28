import { useFormik } from "formik";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyEntity } from "~community/crm/types/CrmCommonTypes";
import {
  addNewIndustryToRecord,
  getChangedCompanyFields,
  getCompanyFormInitialValues,
  getSelectedCompany,
  getTrimmedCompanyValues,
  updateCompany
} from "~community/crm/utils/companyUtil";
import { getCompanyValidationSchema } from "~community/crm/utils/companyValidations";

const EditCompanyModalContent: FC = () => {
  const { setToastMessage } = useToast();

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
    () => getCompanyFormInitialValues(selectedCompany),
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

    setIndustries(
      addNewIndustryToRecord(
        industries,
        updatedCompany.industryId,
        values.industryName?.trim()
      )
    );

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

    const changedFields = getChangedCompanyFields(
      initialValues,
      getTrimmedCompanyValues(values)
    );

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
      onCancel={handleCloseModal}
    />
  );
};

export default EditCompanyModalContent;
