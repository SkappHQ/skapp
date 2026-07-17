import {
  ButtonV2,
  CloseIcon,
  Dropdown,
  InputField
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC } from "react";

import { characterLengths } from "~community/common/constants/stringConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useCheckCompanyNameExists } from "~community/crm/api/CompanyApi";
import { COMPANY_NAME_DEBOUNCE_DELAY } from "~community/crm/constants/companyConstants";
import useGetIndustryOptions from "~community/crm/hooks/useGetIndustryOptions";
import { CrmCompanyFormTypes } from "~community/crm/types/CommonTypes";

interface FieldValidation {
  errorMessage?: string;
  state: "error" | "default";
}

const getFieldValidation = (
  isTouched: boolean | undefined,
  error?: string
): FieldValidation => ({
  errorMessage: isTouched ? error : undefined,
  state: isTouched && error ? "error" : "default"
});

interface CompanyModalFormProps {
  formik: FormikProps<CrmCompanyFormTypes>;
  isPending: boolean;
  translateText: TranslatorFunctionType;
  originalName?: string;
  onCancel: () => void;
}

const CompanyModalForm: FC<CompanyModalFormProps> = ({
  formik,
  isPending,
  translateText,
  originalName,
  onCancel
}) => {
  const industryOptions = useGetIndustryOptions();

  const {
    values,
    errors,
    touched,
    handleChange,
    dirty,
    isSubmitting,
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

  const isAlreadyNameExists =
    !isNameUnchanged && companyNameData?.isExists === true;

  const schemaNameError = touched.name ? errors.name : undefined;
  const nameError = isAlreadyNameExists
    ? translateText(["validations", "companyExists"])
    : schemaNameError;

  const contactNumberValidation = getFieldValidation(
    touched.contactNumber,
    errors.contactNumber
  );
  const websiteValidation = getFieldValidation(touched.website, errors.website);
  const addressValidation = getFieldValidation(touched.address, errors.address);

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
        value={values.contactNumber}
        placeholder={translateText(["placeholders", "contactNumber"])}
        onChange={handleChange}
        errorMessage={contactNumberValidation.errorMessage}
        state={contactNumberValidation.state}
        aria-label={translateText(["ariaLabels", "contactNumber"])}
        fullWidth
      />

      <InputField
        name="website"
        value={values.website}
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
        value={values.address}
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
        value={values.industry}
        onChange={handleIndustryChange}
        label={translateText(["labels", "industry"])}
        className="rounded-lg"
        errorMessage={touched.industry ? errors.industry || "" : ""}
        variant={
          touched.industry && errors.industry ? "primary-error" : "primary"
        }
        ariaLabel={translateText(["ariaLabels", "industry"])}
        width="100%"
      />

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending || isSubmitting}
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
          disabled={isPending || isSubmitting || isAlreadyNameExists || !dirty}
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
