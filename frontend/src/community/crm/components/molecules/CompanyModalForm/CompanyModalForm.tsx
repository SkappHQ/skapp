import {
  ButtonV2,
  CloseIcon,
  Dropdown,
  InputField
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC } from "react";

import { characterLengths } from "~community/common/constants/stringConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useCheckCompanyNameExists } from "~community/crm/api/CompanyApi";
import { COMPANY_NAME_DEBOUNCE_DELAY } from "~community/crm/constants/companyConstants";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import useGetIndustryOptions from "~community/crm/hooks/useGetIndustryOptions";
import { CrmCompanyAddFormTypes } from "~community/crm/types/CommonTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";

interface CompanyModalFormProps {
  translateText: TranslatorFunctionType;
  initialValues: CrmCompanyAddFormTypes;
  isPending: boolean;
  onSubmit: (values: CrmCompanyAddFormTypes) => void;
  onCancel: () => void;
  /** Existing company name when editing; skips the name-exists check while unchanged. */
  originalName?: string;
}

const CompanyModalForm: FC<CompanyModalFormProps> = ({
  translateText,
  initialValues,
  isPending,
  onSubmit,
  onCancel,
  originalName
}) => {
  const industryOptions = useGetIndustryOptions();

  const formik = useFormik<CrmCompanyAddFormTypes>({
    initialValues,
    onSubmit,
    validationSchema: addCompanyValidations(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleChange,
    dirty,
    setFieldValue,
    setFieldError,
    submitForm
  } = formik;

  const clearError = (field: keyof CrmCompanyAddFormTypes) =>
    setFieldError(field, "");

  const debouncedCompanyName = useDebounce(
    values.name.trim(),
    COMPANY_NAME_DEBOUNCE_DELAY
  );

  const trimmedOriginalName = originalName?.trim();
  const isNameUnchanged = values.name.trim() === trimmedOriginalName;

  const { data: companyNameData } = useCheckCompanyNameExists(
    debouncedCompanyName,
    debouncedCompanyName.length > 0 &&
      debouncedCompanyName !== trimmedOriginalName
  );

  const hasNameConflict =
    !isNameUnchanged && companyNameData?.isExists === true;

  const nameError = hasNameConflict
    ? translateText(["validations", "companyExists"])
    : errors.name;

  const handleIndustryChange = (value: string) => {
    setFieldValue("industry", value);
    clearError("industry");
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
        onChange={(e) => {
          handleChange(e);
          clearError("name");
        }}
        aria-label={translateText(["ariaLabels", "companyName"])}
        maxLength={characterLengths.COMPANY_NAME_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="contactNumber"
        label={translateText(["labels", "contactNumber"])}
        value={values.contactNumber || ""}
        placeholder={translateText(["placeholders", "contactNumber"])}
        onChange={(e) => {
          handleChange(e);
          clearError("contactNumber");
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
        onChange={(e) => {
          handleChange(e);
          clearError("website");
        }}
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
        onChange={(e) => {
          handleChange(e);
          clearError("address");
        }}
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
          disabled={isPending}
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isPending || hasNameConflict || !dirty}
          isLoading={isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default CompanyModalForm;
