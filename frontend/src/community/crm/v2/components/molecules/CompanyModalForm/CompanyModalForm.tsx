import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { ChangeEvent, FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import { characterLengths } from "~community/common/constants/stringConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCheckCompanyNameExists } from "~community/crm/v2/api/CompanyApi";
import AddIndustryOption from "~community/crm/v2/components/atoms/AddIndustryOption/AddIndustryOption";
import SelectableSearchField from "~community/crm/v2/components/molecules/SelectableSearchField/SelectableSearchField";
import { ADD_NEW_INDUSTRY_OPTION_ID } from "~community/crm/v2/constants/commonConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmIndustryOption,
  getIndustryDisplayName,
  getIndustryOptions
} from "~community/crm/v2/utils/companyUtil";

interface CompanyModalFormProps {
  formik: FormikProps<CrmCompanyEntity>;
  isPending: boolean;
  originalName?: string;
  onCancel: () => void;
}

const CompanyModalForm: FC<CompanyModalFormProps> = ({
  formik,
  isPending,
  originalName,
  onCancel
}) => {
  const translateText = useTranslator("crmModuleV2");
  const translateAria = useTranslator("crmAriaV2");

  const { industries } = useCrmStoreV2(
    useShallow((store) => ({
      industries: store.industries
    }))
  );

  const [industrySearchTerm, setIndustrySearchTerm] = useState("");

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

  const trimmedName = values.name?.trim() ?? "";
  const trimmedOriginalName = originalName?.trim();
  const debouncedName = useDebounce(trimmedName, SEARCH_DEBOUNCE_DELAY);

  const { data: companyNameData } = useCheckCompanyNameExists(
    debouncedName,
    debouncedName.length > 0 && debouncedName !== trimmedOriginalName
  );

  const isAlreadyNameExists =
    trimmedName === debouncedName &&
    trimmedName !== trimmedOriginalName &&
    companyNameData?.isExists;

  const nameError = isAlreadyNameExists
    ? translateText(["companies", "modal", "validations", "companyExists"])
    : errors.name;

  const industryOptions = useMemo(
    () =>
      getIndustryOptions(industries, translateText, industrySearchTerm, true),
    [industries, translateText, industrySearchTerm]
  );

  const renderIndustryOptionContent = (option: CrmIndustryOption) => {
    if (option.id === ADD_NEW_INDUSTRY_OPTION_ID) {
      return (
        <AddIndustryOption
          label={translateText(
            ["companies", "modal", "labels", "addNewIndustry"],
            {
              name: option.name
            }
          )}
        />
      );
    }

    return option.name;
  };

  const industryDropdownItems: SearchableDropdownItem[] = industryOptions.map(
    (option) => ({
      id: option.id,
      content: renderIndustryOptionContent(option)
    })
  );

  const selectedIndustry =
    values.industryId != null ? industries[values.industryId] : undefined;

  const selectedIndustryLabel =
    values.industryName ??
    (selectedIndustry
      ? getIndustryDisplayName(selectedIndustry, translateText)
      : "");

  const handleIndustrySearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIndustrySearchTerm(e.target.value);
  };

  const handleIndustrySelect = (item: SearchableDropdownItem) => {
    if (item.id === ADD_NEW_INDUSTRY_OPTION_ID) {
      setFieldValue("industryId", null);
      setFieldValue("industryName", industrySearchTerm.trim());
      setIndustrySearchTerm("");
      return;
    }

    setFieldValue("industryId", Number(item.id));
    setFieldValue("industryName", undefined);
    setIndustrySearchTerm("");
  };

  const handleClearIndustry = () => {
    setFieldValue("industryId", null);
    setFieldValue("industryName", undefined);
    setIndustrySearchTerm("");
  };

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={nameError}
        state={nameError ? "error" : "default"}
        label={translateText(["companies", "modal", "labels", "name"])}
        placeholder={translateText([
          "companies",
          "modal",
          "placeholders",
          "name"
        ])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["companies", "modal", "companyName"])}
        maxLength={characterLengths.COMPANY_NAME_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="contactNumber"
        label={translateText(["companies", "modal", "labels", "contactNumber"])}
        value={values.contactNumber}
        placeholder={translateText([
          "companies",
          "modal",
          "placeholders",
          "contactNumber"
        ])}
        onChange={handleChange}
        onBlur={handleBlur}
        errorMessage={errors.contactNumber}
        state={errors.contactNumber ? "error" : "default"}
        aria-label={translateAria(["companies", "modal", "contactNumber"])}
        fullWidth
      />

      <InputField
        name="website"
        value={values.website}
        errorMessage={errors.website}
        state={errors.website ? "error" : "default"}
        label={translateText(["companies", "modal", "labels", "website"])}
        placeholder={translateText([
          "companies",
          "modal",
          "placeholders",
          "website"
        ])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["companies", "modal", "website"])}
        fullWidth
      />

      <InputField
        name="address"
        value={values.address}
        errorMessage={errors.address}
        state={errors.address ? "error" : "default"}
        label={translateText(["companies", "modal", "labels", "address"])}
        placeholder={translateText([
          "companies",
          "modal",
          "placeholders",
          "address"
        ])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["companies", "modal", "address"])}
        fullWidth
      />

      <SelectableSearchField
        id="company-industry-search"
        label={translateText(["companies", "modal", "labels", "industry"])}
        placeholder={translateText([
          "companies",
          "modal",
          "placeholders",
          "industry"
        ])}
        selectedValue={selectedIndustryLabel}
        onClear={handleClearIndustry}
        clearAriaLabel={translateAria(["companies", "modal", "clearIndustry"])}
        fieldAriaLabel={translateAria(["companies", "modal", "industry"])}
        searchValue={industrySearchTerm}
        onSearchChange={handleIndustrySearchChange}
        items={industryDropdownItems}
        onSelect={handleIndustrySelect}
        emptyMessage={translateText([
          "companies",
          "modal",
          "emptyStates",
          "noIndustries"
        ])}
      />

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending || isSubmitting}
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateAria(["companies", "modal", "cancel"])}
        >
          {translateText(["companies", "modal", "buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isPending || isSubmitting || isAlreadyNameExists || !dirty}
          isLoading={isPending}
          aria-label={translateAria(["companies", "modal", "save"])}
        >
          {translateText(["companies", "modal", "buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default CompanyModalForm;
