import {
  ButtonV2,
  CloseIcon,
  Dropdown,
  InputField
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { ChangeEvent, FC } from "react";

import InputPhoneNumber from "~community/common/components/molecules/InputPhoneNumber/InputPhoneNumber";
import { characterLengths } from "~community/common/constants/stringConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useCheckCompanyNameExists } from "~community/crm/api/CompanyApi";
import { COMPANY_NAME_DEBOUNCE_DELAY } from "~community/crm/constants/companyConstants";
import useGetIndustryOptions from "~community/crm/hooks/useGetIndustryOptions";
import { CrmCompanyFormTypes } from "~community/crm/types/CommonTypes";

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
    handleChange,
    handleBlur,
    dirty,
    isSubmitting,
    setFieldValue,
    submitForm
  } = formik;

  const handleChangeCountry = async (code: string) => {
    await setFieldValue("countryCode", code);
  };

  const handleChangeContactNumber = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    handleChange(e);
  };

  const trimmedName = values.name.trim();
  const trimmedOriginalName = originalName?.trim();
  const debouncedName = useDebounce(trimmedName, COMPANY_NAME_DEBOUNCE_DELAY);

  const { data: companyNameData } = useCheckCompanyNameExists(
    debouncedName,
    debouncedName.length > 0 && debouncedName !== trimmedOriginalName
  );

  const isAlreadyNameExists =
    trimmedName !== trimmedOriginalName && companyNameData?.isExists;

  const nameError = isAlreadyNameExists
    ? translateText(["validations", "companyExists"])
    : errors.name;

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
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "companyName"])}
        maxLength={characterLengths.COMPANY_NAME_LENGTH}
        required
        fullWidth
      />

      <InputPhoneNumber
        inputName="contactNumber"
        label={translateText(["labels", "contactNumber"])}
        value={values.contactNumber}
        countryCodeValue={values.countryCode}
        onChangeCountry={handleChangeCountry}
        onChange={handleChangeContactNumber}
        placeHolder={translateText(["placeholders", "contactNumber"])}
        error={errors.contactNumber}
        ariaLabel={translateText(["ariaLabels", "contactNumber"])}
      />

      <InputField
        name="website"
        value={values.website}
        errorMessage={errors.website}
        state={errors.website ? "error" : "default"}
        label={translateText(["labels", "website"])}
        placeholder={translateText(["placeholders", "website"])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "website"])}
        fullWidth
      />

      <InputField
        name="address"
        value={values.address}
        errorMessage={errors.address}
        state={errors.address ? "error" : "default"}
        label={translateText(["labels", "address"])}
        placeholder={translateText(["placeholders", "address"])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "address"])}
        fullWidth
      />

      <Dropdown
        options={industryOptions}
        value={values.industry}
        onChange={handleIndustryChange}
        label={translateText(["labels", "industry"])}
        className="rounded-lg"
        variant="primary"
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
