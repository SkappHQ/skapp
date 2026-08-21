import { useFormik } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateCompany } from "~community/crm/v2/api/CompanyApi";
import CompanyModalForm from "~community/crm/v2/components/molecules/CompanyModalForm/CompanyModalForm";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getCompanyFormInitialValues,
  getTrimmedCompanyValues
} from "~community/crm/v2/utils/companyUtil";
import { getCompanyValidationSchema } from "~community/crm/v2/utils/companyValidations";

const AddCompanyModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "companies", "companyModal");

  const {
    companies,
    companyIds,
    setCompanies,
    setCompanyIds,
    setIsCompanyModalOpen
  } = useCrmStoreV2(
    useShallow((store) => ({
      companies: store.companies,
      companyIds: store.companyIds,
      setCompanies: store.setCompanies,
      setCompanyIds: store.setCompanyIds,
      setIsCompanyModalOpen: store.setIsCompanyModalOpen
    }))
  );

  const formik = useFormik<CrmCompanyEntity>({
    initialValues: getCompanyFormInitialValues(),
    onSubmit: (values) => createCompany(values),
    validationSchema: getCompanyValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = (createdCompany: CrmCompanyEntity) => {
    setSubmitting(false);

    if (createdCompany.id !== undefined) {
      setCompanies({ ...companies, [createdCompany.id]: createdCompany });
      setCompanyIds([createdCompany.id, ...companyIds]);
    }

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

  const { mutate: createNewCompany, isPending } = useCreateCompany(
    handleSuccess,
    handleError
  );

  const createCompany = (values: CrmCompanyEntity) => {
    createNewCompany(getTrimmedCompanyValues(values));
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
