import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { characterLengths } from "~community/common/constants/stringConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useGetCompanyLookup } from "~community/crm/api/ContactApi";
import EditableContactOwnerField from "~community/crm/components/molecules/EditableContactOwnerField/EditableContactOwnerField";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import {
  CompanyLookup,
  CrmContactFormValues,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { addContactValidations } from "~community/crm/utils/contactValidations";

export interface ContactFormProps {
  translateContactText: TranslatorFunctionType;
  initialValues: CrmContactFormValues;
  initialCompany: CompanyLookup | null;
  initialOwner: CrmOwner | null;
  isPending: boolean;
  onSubmit: (values: CrmContactFormValues) => void;
  onCancel: () => void;
}

const ContactModalForm = ({
  translateContactText,
  initialValues,
  initialCompany,
  initialOwner,
  isPending,
  onSubmit,
  onCancel
}: ContactFormProps) => {
  const { isCrmSalesManager: canEditOwner } = useSessionData();

  const [companySearchText, setCompanySearchText] = useState<string>("");
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>(
    initialCompany?.name ?? ""
  );

  const debouncedCompanySearch = useDebounce(
    companySearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const formik = useFormik<CrmContactFormValues>({
    initialValues,
    onSubmit,
    validationSchema: addContactValidations(translateContactText),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const { values, errors, handleChange, setFieldValue, submitForm } = formik;

  const { data: companyLookupData, isFetching: isCompanyFetching } =
    useGetCompanyLookup(debouncedCompanySearch, DEFAULT_LOOKUP_PAGE_SIZE);

  const companyDropdownItems: SearchableDropdownItem[] =
    companyLookupData?.items?.map((company) => ({
      id: String(company.id),
      content: company.name
    })) ?? [];

  const handleCompanySelect = (item: SearchableDropdownItem) => {
    const company = companyLookupData?.items?.find(
      (lookupCompany) => String(lookupCompany.id) === item.id
    );

    setFieldValue("companyId", Number(item.id));
    setSelectedCompanyName(company?.name ?? String(item.content));
    setCompanySearchText("");
  };

  const handleClearCompany = () => {
    setFieldValue("companyId", null);
    setSelectedCompanyName("");
    setCompanySearchText("");
  };

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={errors.name}
        state={errors.name ? "error" : "default"}
        label={translateContactText(["labels", "name"])}
        placeholder={translateContactText(["placeholders", "name"])}
        onChange={handleChange}
        aria-label={translateContactText(["ariaLabels", "name"])}
        maxLength={characterLengths.NAME_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="email"
        value={values.email}
        errorMessage={errors.email}
        state={errors.email ? "error" : "default"}
        label={translateContactText(["labels", "email"])}
        placeholder={translateContactText(["placeholders", "email"])}
        onChange={handleChange}
        aria-label={translateContactText(["ariaLabels", "email"])}
        required
        fullWidth
      />

      {values.companyId === null ? (
        <SearchableDropdown
          id="contact-company"
          name="company"
          label={translateContactText(["labels", "company"])}
          placeholder={translateContactText(["placeholders", "company"])}
          items={companyDropdownItems}
          value={companySearchText}
          onChange={(event) => setCompanySearchText(event.target.value)}
          onSelect={handleCompanySelect}
          onClose={() => setCompanySearchText("")}
          emptyMessage={
            isCompanyFetching ? undefined : (
              <p className="px-4 py-2 body2">
                {translateContactText(["emptyStates", "noCompanies"])}
              </p>
            )
          }
        />
      ) : (
        <InputField
          label={translateContactText(["labels", "company"])}
          value={selectedCompanyName}
          readOnly
          fullWidth
          variant="md"
          styleOverrides={{
            labelContainer:
              "h-6 inline-flex self-stretch pr-3 justify-start items-center gap-2"
          }}
          customStyles={{ gap: "gap-2" }}
          aria-label={translateContactText(["ariaLabels", "company"])}
          rightIcon={
            <ButtonV2
              variant="tertiary"
              type="button"
              onClick={handleClearCompany}
              aria-label={translateContactText(["ariaLabels", "clearCompany"])}
              icon={<CloseIcon />}
            />
          }
        />
      )}

      <InputField
        name="contactNumber"
        value={values.contactNumber}
        errorMessage={errors.contactNumber}
        state={errors.contactNumber ? "error" : "default"}
        label={translateContactText(["labels", "contactNumber"])}
        placeholder={translateContactText(["placeholders", "contactNumber"])}
        onChange={handleChange}
        aria-label={translateContactText(["ariaLabels", "contactNumber"])}
        maxLength={characterLengths.PHONE_NUMBER_LENGTH_MAX}
        fullWidth
      />

      {canEditOwner ? (
        <EditableContactOwnerField
          initialOwner={initialOwner}
          errorMessage={errors.ownerId}
          translateContactText={translateContactText}
          onChange={(owner) =>
            setFieldValue("ownerId", owner?.employeeId ?? null)
          }
        />
      ) : (
        <SelectedOwnerField
          label={translateContactText(["labels", "owner"])}
          owner={initialOwner}
          onRemove={() => undefined}
          showRemoveButton={false}
          ariaLabel={translateContactText(["ariaLabels", "clearOwner"])}
        />
      )}

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending}
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateContactText(["ariaLabels", "cancel"])}
        >
          {translateContactText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={() => void submitForm()}
          disabled={isPending}
          isLoading={isPending}
          aria-label={translateContactText(["ariaLabels", "save"])}
        >
          {translateContactText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ContactModalForm;
