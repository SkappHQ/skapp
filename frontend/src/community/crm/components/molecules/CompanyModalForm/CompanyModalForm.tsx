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
import { CrmCompanyFormTypes } from "~community/crm/types/CommonTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";

interface CompanyModalFormProps {
  translateText: TranslatorFunctionType;
  initialValues: CrmCompanyFormTypes;
  isPending: boolean;
  onSubmit: (values: CrmCompanyFormTypes) => void;
  onCancel: () => void;
  originalName?: string;
}


interface FieldValidationParams {
  isTouched?: boolean;
  error?: string;
}

const getFieldValidation = ({
  isTouched,
  error
}: FieldValidationParams): {
  errorMessage: string | undefined;
  state: "error" | "default";
} => ({
  errorMessage: isTouched ? error : undefined,
  state: isTouched && error ? "error" : "default"
});

const CompanyModalForm: FC<CompanyModalFormProps> = ({
  translateText,
  initialValues,
  isPending,
  onSubmit,
  onCancel,
  originalName
}) => {
  const industryOptions = useGetIndustryOptions();

  const formik = useFormik<CrmCompanyFormTypes>({
    initialValues,
    onSubmit: (values, { setSubmitting }) => {
      onSubmit(values);
      setSubmitting(false);
    },
    validationSchema: addCompanyValidations(translateText),
    validateOnChange: true,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    dirty,
    setFieldValue,
    submitForm
  } = formik;

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

  const schemaNameError = touched.name ? errors.name : undefined;
  const nameError = hasNameConflict
    ? translateText(["validations", "companyExists"])
    : schemaNameError;

  const contactNumberValidation = getFieldValidation({
    isTouched: touched.contactNumber,
    error: errors.contactNumber
  });
  const websiteValidation = getFieldValidation({
    isTouched: touched.website,
    error: errors.website
  });
  const addressValidation = getFieldValidation({
    isTouched: touched.address,
    error: errors.address
  });
  const industryValidation = getFieldValidation({
    isTouched: touched.industry,
    error: errors.industry
  });

  const handleIndustryChange = (value: string) => {
    setFieldValue("industry", value);
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
        maxLength={characterLengths.COMPANY_NAME_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="contactNumber"
        label={translateText(["labels", "contactNumber"])}
        value={values.contactNumber || ""}
        placeholder={translateText(["placeholders", "contactNumber"])}
        onChange={handleChange}
        errorMessage={contactNumberValidation.errorMessage}
        state={contactNumberValidation.state}
        aria-label={translateText(["ariaLabels", "contactNumber"])}
        fullWidth
      />

      <InputField
        name="website"
        value={values.website || ""}
        errorMessage={websiteValidation.errorMessage}
        state={websiteValidation.state}
        label={translateText(["labels", "website"])}
        placeholder={translateText(["placeholders", "website"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "website"])}
        fullWidth
      />

      <InputField
        name="address"
        value={values.address || ""}
        errorMessage={addressValidation.errorMessage}
        state={addressValidation.state}
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
        errorMessage={industryValidation.errorMessage || ""}
        variant={
          industryValidation.state === "error" ? "primary-error" : "primary"
        }
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
