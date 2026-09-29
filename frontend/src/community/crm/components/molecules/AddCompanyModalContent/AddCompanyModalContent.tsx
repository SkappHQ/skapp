import { useFormik } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyEntity } from "~community/crm/types/CrmCommonTypes";
import { getCompanyValidationSchema } from "~community/crm/utils/companyValidations";

const AddCompanyModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule");

  const {
    companies,
    companyIds,
    setCompanies,
    setCompanyIds,
    setIsCompanyModalOpen
  } = useCrmStore(
    useShallow((store) => ({
      companies: store.companies,
      companyIds: store.companyIds,
      setCompanies: store.setCompanies,
      setCompanyIds: store.setCompanyIds,
      setIsCompanyModalOpen: store.setIsCompanyModalOpen
    }))
  );

  const formik = useFormik<CrmCompanyEntity>({
    initialValues: {
      name: "",
      industry: CrmIndustryEnum.NONE,
      website: "",
      address: "",
      contactNumber: ""
    },
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
      title: translateText([
        "companies",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "companies",
        "modal",
        "toastMessages",
        "addSuccessDescription"
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
        "addErrorDescription"
      ])
    });
  };

  const { mutate: createNewCompany, isPending } = useCreateCompany(
    handleSuccess,
    handleError
  );

  const createCompany = (values: CrmCompanyEntity) => {
    createNewCompany({
      name: values.name?.trim(),
      industry: values.industry,
      website: values.website?.trim(),
      address: values.address?.trim(),
      contactNumber: values.contactNumber?.trim()
    });
  };

  return (
    <CompanyModalForm
      formik={formik}
      isPending={isPending}
      onCancel={handleCloseModal}
    />
  );
};

export default AddCompanyModalContent;
