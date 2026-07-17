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
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCheckCompanyNameExists } from "~community/crm/api/CompanyApi";
import { COMPANY_NAME_DEBOUNCE_DELAY } from "~community/crm/constants/companyConstants";
import { CrmIndustryEnum } from "~community/crm/enums/common";
import useGetIndustryOptions from "~community/crm/hooks/useGetIndustryOptions";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompany,
  CrmCompanyFormTypes
} from "~community/crm/types/CommonTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";

type CompanyModalFormMode = "add" | "edit";

interface CompanyModalFormProps {
  mode: CompanyModalFormMode;
  isPending: boolean;
  onSubmit: (values: CrmCompanyFormTypes) => void;
  onCancel: () => void;
}

const getInitialValues = (company?: CrmCompany): CrmCompanyFormTypes => ({
  name: company?.name || "",
  industry: company?.industry || CrmIndustryEnum.NONE,
  website: company?.website || "",
  address: company?.address || "",
  contactNumber: company?.contactNumber || ""
});

const CompanyModalForm: FC<CompanyModalFormProps> = ({
  mode,
  isPending,
  onSubmit,
  onCancel
}) => {
  const translateText = useTranslator("crmModule", "companies", "companyModal");

  const industryOptions = useGetIndustryOptions();

  const { selectedCompanyId, getCompanyById } = useCrmStore((store) => ({
    selectedCompanyId: store.selectedCompanyId,
    getCompanyById: store.getCompanyById
  }));

  const selectedCompany =
    mode === "edit" ? getCompanyById(selectedCompanyId!) : undefined;

  const initialValues = getInitialValues(selectedCompany);
  const originalName = selectedCompany?.name;

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

  const isAlreadyNameExists =
    !isNameUnchanged && companyNameData?.isExists === true;

  const schemaNameError = touched.name ? errors.name : undefined;
  const nameError = isAlreadyNameExists
    ? translateText(["validations", "companyExists"])
    : schemaNameError;

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
        errorMessage={touched.contactNumber ? errors.contactNumber : undefined}
        state={
          touched.contactNumber && errors.contactNumber ? "error" : "default"
        }
        aria-label={translateText(["ariaLabels", "contactNumber"])}
        fullWidth
      />

      <InputField
        name="website"
        value={values.website}
        errorMessage={touched.website ? errors.website : undefined}
        state={touched.website && errors.website ? "error" : "default"}
        label={translateText(["labels", "website"])}
        placeholder={translateText(["placeholders", "website"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "website"])}
        fullWidth
      />

      <InputField
        name="address"
        value={values.address}
        errorMessage={touched.address ? errors.address : undefined}
        state={touched.address && errors.address ? "error" : "default"}
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
          disabled={isPending || isAlreadyNameExists || !dirty}
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
