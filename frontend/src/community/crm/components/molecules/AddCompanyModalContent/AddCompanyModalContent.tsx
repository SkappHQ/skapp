import { useFormik } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateCompany } from "~community/crm/api/CompanyApi";
import CompanyModalForm from "~community/crm/components/molecules/CompanyModalForm/CompanyModalForm";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyEntity } from "~community/crm/types/CrmCommonTypes";
import { addNewIndustryToRecord } from "~community/crm/utils/companyUtil";
import { getCompanyValidationSchema } from "~community/crm/utils/companyValidations";

const AddCompanyModalContent: FC = () => {
  const { setToastMessage } = useToast();
  const { isCrmSalesManager } = useSessionData();

  const translateText = useTranslator("crmModule");

  const {
    companies,
    companyIds,
    industries,
    setCompanies,
    setCompanyIds,
    setIndustries,
    setIsCompanyModalOpen
  } = useCrmStore(
    useShallow((store) => ({
      companies: store.companies,
      companyIds: store.companyIds,
      industries: store.industries,
      setCompanies: store.setCompanies,
      setCompanyIds: store.setCompanyIds,
      setIndustries: store.setIndustries,
      setIsCompanyModalOpen: store.setIsCompanyModalOpen
    }))
  );

  const formik = useFormik<CrmCompanyEntity>({
    initialValues: {
      name: "",
      industryId: null,
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

  const { setSubmitting, values } = formik;

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const handleSuccess = (createdCompany: CrmCompanyEntity) => {
    setSubmitting(false);

    if (createdCompany.id !== undefined) {
      setCompanies({ ...companies, [createdCompany.id]: createdCompany });
      setCompanyIds([createdCompany.id, ...companyIds]);
    }

    setIndustries(
      addNewIndustryToRecord(
        industries,
        createdCompany.industryId,
        values.industryName
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
      industryId: values.industryId,
      industryName: values.industryName?.trim(),
      website: values.website?.trim(),
      address: values.address?.trim(),
      contactNumber: values.contactNumber?.trim()
    });
  };

  return (
    <CompanyModalForm
      formik={formik}
      isPending={isPending}
      canAddNewIndustry={isCrmSalesManager}
      onCancel={handleCloseModal}
    />
  );
};

export default AddCompanyModalContent;
