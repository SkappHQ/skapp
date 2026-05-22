import { ButtonV2, InputField } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { ChangeEvent, useEffect } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import { characterLengths } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useCheckCompanyNameExists,
  useCreateNewCompany
} from "~community/crm/api/CompanyApi";
import {
  COMPANY_NAME_DEBOUNCE_DELAY
} from "~community/crm/constants/companyConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompanyAddFormTypes,
  CrmCompanyCreatePayload
} from "~community/crm/types/CommonTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";

const AddCompanyModal: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "companies",
    "addCompanyModal"
  );

  const translateToasts = useTranslator(
    "crmModule",
    "companies",
    "companyToastMessages"
  );

  const { setIsAddCompanyModalOpen } = useCrmStore((store) => ({
    setIsAddCompanyModalOpen: store.setIsAddCompanyModalOpen
  }));


  const initialValues: CrmCompanyAddFormTypes = {
    name: "",
    industry: null,
    website: null,
    address: null,
    contactNumber: null
  };

  const handleSuccess = () => {
    setSubmitting(false);
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateToasts(["successTitle"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateToasts(["errorTitle"]),
      description: translateToasts(["errorDescription"])
    });
  };

  const handleCloseModal = (): void => {
    setIsAddCompanyModalOpen(false);
  };

  const { mutate: createNewCompany, isPending } = useCreateNewCompany(
    handleSuccess,
    handleError
  );

  const createCompany = (values: CrmCompanyAddFormTypes) => {
    const payload: CrmCompanyCreatePayload = {
      name: values.name.trim(),
      industry: values.industry?.trim() || null,
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: values.contactNumber?.trim() || null
    };

    createNewCompany(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: createCompany,
    validationSchema: addCompanyValidations(translateText),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleChange,
    isSubmitting,
    setFieldError,
    setSubmitting,
    submitForm
  } = formik;

  const debouncedCompanyName = useDebounce(
    values.name.trim(),
    COMPANY_NAME_DEBOUNCE_DELAY
  );
  const { data: companyNameData } = useCheckCompanyNameExists(
    debouncedCompanyName,
    debouncedCompanyName.length > 0
  );

  useEffect(() => {
    if (companyNameData?.isExists) {
      setFieldError("name", translateText(["validations", "companyExists"]));
    } else if (values.name.trim().length > 0) {
      setFieldError("name", undefined);
    }
  }, [companyNameData?.isExists, setFieldError, translateText, values.name]);

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={errors.name}
        state={errors.name || companyNameData?.isExists ? "error" : "default"}
        label={translateText(["labels", "name"])}
        placeholder={translateText(["placeholders", "name"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "companyName"])}
        maxLength={characterLengths.NAME_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="contactNumber"
        label={translateText(["labels", "contactNumber"])}
        value={values.contactNumber || ""}
        placeholder={translateText(["placeholders", "contactNumber"])}
        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
          handleChange(e);
        }}
        errorMessage={errors.contactNumber || ""}
        state={errors.contactNumber ? "error" : "default"}
        aria-label={translateText(["ariaLabels", "contactNumber"])}
        fullWidth
      />

      <InputField
        name="website"
        value={values.website || ""}
        errorMessage={errors.website || ""}
        state={errors.website ? "error" : "default"}
        label={translateText(["labels", "website"])}
        placeholder={translateText(["placeholders", "website"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "website"])}
        fullWidth
      />

      <InputField
        name="address"
        value={values.address || ""}
        errorMessage={errors.address || ""}
        state={errors.address ? "error" : "default"}
        label={translateText(["labels", "address"])}
        placeholder={translateText(["placeholders", "address"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "address"])}
        fullWidth
      />

      <InputField
        name="industry"
        value={values.industry || ""}
        errorMessage={errors.industry || ""}
        state={errors.industry ? "error" : "default"}
        label={translateText(["labels", "industry"])}
        placeholder={translateText(["placeholders", "industry"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "industry"])}
        fullWidth
      />

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isSubmitting}
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancelAddCompany"])}
        >
          {translateText(["buttons", "cancelAddCompany"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={() => submitForm()}
          disabled={
            isSubmitting || isPending || companyNameData?.isExists === true
          }
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default AddCompanyModal;
