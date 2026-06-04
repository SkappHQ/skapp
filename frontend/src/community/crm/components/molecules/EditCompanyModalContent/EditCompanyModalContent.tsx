import {
  ButtonV2,
  CloseIcon,
  Dropdown,
  InputField
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React from "react";

import { characterLengths } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useCheckCompanyNameExists,
  useEditCompany
} from "~community/crm/api/CompanyApi";
import { COMPANY_NAME_DEBOUNCE_DELAY } from "~community/crm/constants/companyConstants";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import useGetIndustryOptions from "~community/crm/hooks/useGetIndustryOptions";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompanyEditFormTypes,
  EditCompanyPayload
} from "~community/crm/types/CommonTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";

const EditCompanyModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "companies",
    "editCompanyModal"
  );

  const translateToasts = useTranslator(
    "crmModule",
    "companies",
    "editCompanyToastMessages"
  );

  const industryOptions = useGetIndustryOptions();

  const { setIsCompanyModalOpen, selectedCompany, setSelectedCompany } =
    useCrmStore((store) => ({
      setIsCompanyModalOpen: store.setIsCompanyModalOpen,
      selectedCompany: store.selectedCompany,
      setSelectedCompany: store.setSelectedCompany
    }));

  const initialValues: CrmCompanyEditFormTypes = {
    name: selectedCompany?.name || "",
    industry: selectedCompany?.industry || CrmIndustryEnum.NONE,
    website: selectedCompany?.website || null,
    address: selectedCompany?.address || null,
    contactNumber: selectedCompany?.contactNumber || null
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
    setIsCompanyModalOpen(false);
    setSelectedCompany(null);
  };

  const { mutate: editCompany, isPending } = useEditCompany(
    handleSuccess,
    handleError
  );

  const submitEditCompany = (values: CrmCompanyEditFormTypes) => {
    if (!selectedCompany) return;

    const payload: EditCompanyPayload = {
      id: selectedCompany.id,
      name: values.name.trim(),
      industry: values.industry,
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: values.contactNumber?.trim() || null
    };

    editCompany(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: submitEditCompany,
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
    setSubmitting,
    submitForm
  } = formik;

  const debouncedCompanyName = useDebounce(
    values.name.trim(),
    COMPANY_NAME_DEBOUNCE_DELAY
  );

  const { data: checkedCompanyName } = useCheckCompanyNameExists(
    debouncedCompanyName,
    debouncedCompanyName.length > 0 &&
      debouncedCompanyName !== selectedCompany?.name?.trim()
  );

  const isNameUnchanged = values.name.trim() === selectedCompany?.name?.trim();

  const hasNameConflict =
    !isNameUnchanged && checkedCompanyName?.isExists === true;

  const nameError = hasNameConflict
    ? translateText(["validations", "companyExists"])
    : errors.name;

  const isSubmitDisabled =
    !selectedCompany || isSubmitting || isPending || hasNameConflict;

  const handleIndustryChange = (value: string) => {
    formik.setFieldValue("industry", value);
  };

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={nameError}
        state={nameError ? "error" : "default"}
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
        onChange={handleChange}
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

      <Dropdown
        options={industryOptions}
        value={values.industry || CrmIndustryEnum.NONE}
        onChange={handleIndustryChange}
        label={translateText(["labels", "industry"])}
        className="rounded-lg"
        errorMessage={errors.industry || ""}
        variant={errors.industry ? "primary-error" : "primary"}
        ariaLabel={translateText(["ariaLabels", "industry"])}
        width="100%"
      />

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isSubmitting}
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancelEditCompany"])}
        >
          {translateText(["buttons", "cancelEditCompany"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isSubmitDisabled}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default EditCompanyModalContent;
