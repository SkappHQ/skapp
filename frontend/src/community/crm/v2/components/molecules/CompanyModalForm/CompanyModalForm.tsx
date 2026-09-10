import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { ChangeEvent, FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import { characterLengths } from "~community/common/constants/stringConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import { useCheckCompanyNameExists } from "~community/crm/v2/api/CompanyApi";
import AddIndustryOption from "~community/crm/v2/components/atoms/AddIndustryOption/AddIndustryOption";
import { ADD_INDUSTRY_ITEM_ID } from "~community/crm/v2/constants/commonConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmCompanyEntity,
  CrmIndustryEntity
} from "~community/crm/v2/types/CrmCommonTypes";

interface CompanyModalFormProps {
  formik: FormikProps<CrmCompanyEntity>;
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
  const { industries } = useCrmStoreV2(
    useShallow((store) => ({
      industries: store.industries
    }))
  );

  const industryOptions = useMemo(
    () =>
      Object.values(industries).map((industry) => ({
        id: String(industry.id),
        label: industry.name
      })),
    [industries]
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
    ? translateText(["validations", "companyExists"])
    : errors.name;

  const industryDropdownItems: SearchableDropdownItem[] = useMemo(() => {
    const searchTerm = industrySearchTerm.trim();

    const matches = industryOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const items: SearchableDropdownItem[] = matches.map((option) => ({
      id: option.id,
      content: option.label
    }));

    const hasExactMatch = matches.some(
      (option) => option.label.toLowerCase() === searchTerm.toLowerCase()
    );

    if (searchTerm.length > 0 && !hasExactMatch) {
      items.push({
        id: ADD_INDUSTRY_ITEM_ID,
        content: (
          <AddIndustryOption
            name={searchTerm}
            onCreated={handleIndustrySelected}
          />
        )
      });
    }

    return items;
  }, [industryOptions, industrySearchTerm]);

  const selectedIndustryLabel = values.industry
    ? (industries[Number(values.industry)]?.name ?? "")
    : "";

  const handleIndustrySearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIndustrySearchTerm(e.target.value);
  };

  const handleIndustrySelected = (industry: CrmIndustryEntity) => {
    setFieldValue("industry", industry.id);
    setIndustrySearchTerm("");
  };

  const handleIndustrySelect = (item: SearchableDropdownItem) => {
    const industry = industries[Number(item.id)];

    if (!industry) return;

    handleIndustrySelected(industry);
  };

  const handleClearIndustry = () => {
    setFieldValue("industry", undefined);
    setIndustrySearchTerm("");
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

      <InputField
        name="contactNumber"
        label={translateText(["labels", "contactNumber"])}
        value={values.contactNumber}
        placeholder={translateText(["placeholders", "contactNumber"])}
        onChange={handleChange}
        onBlur={handleBlur}
        errorMessage={errors.contactNumber}
        state={errors.contactNumber ? "error" : "default"}
        aria-label={translateText(["ariaLabels", "contactNumber"])}
        fullWidth
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

      <SelectableSearchField
        id="company-industry-search"
        label={translateText(["labels", "industry"])}
        placeholder={translateText(["placeholders", "industry"])}
        selectedValue={selectedIndustryLabel}
        onClear={handleClearIndustry}
        clearAriaLabel={translateText(["ariaLabels", "clearIndustry"])}
        fieldAriaLabel={translateText(["ariaLabels", "industry"])}
        searchValue={industrySearchTerm}
        onSearchChange={handleIndustrySearchChange}
        items={industryDropdownItems}
        onSelect={handleIndustrySelect}
        emptyMessage={translateText(["emptyStates", "noIndustries"])}
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
