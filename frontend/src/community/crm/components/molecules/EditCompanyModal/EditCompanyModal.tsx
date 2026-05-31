import { ButtonV2, Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { ChangeEvent, useEffect, useMemo } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
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
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyEditFormTypes } from "~community/crm/types/CommonTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";

const EditCompanyModal: React.FC = () => {
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

  const translateIndustryOptions = useTranslator(
    "crmModule",
    "companies",
    "industryOptions"
  );

  const industryOptions = useMemo(      // TODO: add the useGetIndustries hook when merged
    () =>
      Object.values(CrmIndustryEnum).map((industry) => ({
        id: industry,
        label: translateIndustryOptions([industry]),
        value: industry
      })),
    [translateIndustryOptions]
  );

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

    const payload = {
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
    setFieldError,
    setSubmitting,
    submitForm
  } = formik;

  const isNameUnchanged = values.name.trim() === selectedCompany?.name?.trim();

  const debouncedCompanyName = useDebounce(
    values.name.trim(),
    COMPANY_NAME_DEBOUNCE_DELAY
  );

  const { data: companyNameData } = useCheckCompanyNameExists(
    debouncedCompanyName,
    debouncedCompanyName.length > 0 &&
      debouncedCompanyName !== selectedCompany?.name?.trim()
  );

  const handleIndustryChange = (value: string) => {
    formik.setFieldValue("industry", value);
  };

  useEffect(() => {
    if (isNameUnchanged) {
      setFieldError("name", undefined);
    } else if (companyNameData?.isExists) {
      setFieldError("name", translateText(["validations", "companyExists"]));
    } else if (values.name.trim().length > 0) {
      setFieldError("name", undefined);
    }
  }, [
    companyNameData?.isExists,
    isNameUnchanged,
    setFieldError,
    translateText,
    values.name
  ]);

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={errors.name}
        state={
          errors.name || (!isNameUnchanged && companyNameData?.isExists)
            ? "error"
            : "default"
        }
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
          onClick={() => submitForm()}
          disabled={
            !selectedCompany ||
            isSubmitting ||
            isPending ||
            (!isNameUnchanged && companyNameData?.isExists === true)
          }
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default EditCompanyModal;
