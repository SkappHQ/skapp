import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { useMemo, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { isValidEmail } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { useSearchCompaniesByDomain } from "~community/crm/api/CompanyApi";
import { useGetCompanyLookup } from "~community/crm/api/ContactApi";
import SuggestedBadge from "~community/crm/components/atoms/SuggestedBadge/SuggestedBadge";
import EditableContactOwnerField from "~community/crm/components/molecules/EditableContactOwnerField/EditableContactOwnerField";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_NUMBER_MAX_LENGTH
} from "~community/crm/constants/contactConstants";
import {
  CrmContactFormValues,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { extractDomainFromEmail } from "~community/crm/utils/commonHelpers";
import { mergeAndPrioritizeCompanyDropdownItems } from "~community/crm/utils/contactUtil";
import { addContactValidations } from "~community/crm/utils/contactValidations";

export interface ContactFormProps {
  translateContactText: TranslatorFunctionType;
  initialValues: CrmContactFormValues;
  initialOwner: CrmOwner | null;
  initialCompanyName?: string;
  isPending: boolean;
  onSubmit: (values: CrmContactFormValues) => void;
  onCancel: () => void;
}

const ContactModalForm = ({
  translateContactText,
  initialValues,
  initialOwner,
  initialCompanyName,
  isPending,
  onSubmit,
  onCancel
}: ContactFormProps) => {
  const { isCrmSalesManager: canEditOwner } = useSessionData();

  const [companySearchText, setCompanySearchText] = useState<string>("");
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>(
    initialCompanyName ?? ""
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

  const { values, errors, handleChange, setFieldValue, submitForm, dirty } =
    formik;

  const debouncedEmail = useDebounce(
    values.email.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const extractedDomain = extractDomainFromEmail(debouncedEmail);
  const isDomainSearchEnabled =
    extractedDomain.length > 0 && isValidEmail().test(debouncedEmail);

  const { data: domainSearchData } = useSearchCompaniesByDomain(
    extractedDomain,
    isDomainSearchEnabled
  );

  const { data: companyLookupData } = useGetCompanyLookup(
    debouncedCompanySearch,
    DEFAULT_LOOKUP_PAGE_SIZE
  );

  const addSuggestedLabel = (
    item: SearchableDropdownItem
  ): SearchableDropdownItem => ({
    ...item,
    content: (
      <SuggestedBadge label={translateContactText(["labels", "suggested"])}>
        {item.content}
      </SuggestedBadge>
    )
  });

  const companyDropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      mergeAndPrioritizeCompanyDropdownItems(
        companyLookupData?.items,
        domainSearchData?.companies
      ).map((item) => (item.isPrioritized ? addSuggestedLabel(item) : item)),
    [
      companyLookupData?.items,
      domainSearchData?.companies,
      translateContactText
    ]
  );

  const handleCompanySelect = (item: SearchableDropdownItem) => {
    const company =
      companyLookupData?.items?.find(
        (lookupCompany) => String(lookupCompany.id) === item.id
      ) ??
      domainSearchData?.companies?.find(
        (domainCompany) => String(domainCompany.id) === item.id
      );

    setFieldValue("companyId", Number(item.id));
    setSelectedCompanyName(company?.name ?? "");
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
        maxLength={CONTACT_NAME_MAX_LENGTH}
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
        maxLength={CONTACT_EMAIL_MAX_LENGTH}
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
          isOpenOnFocus={true}
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
        maxLength={CONTACT_NUMBER_MAX_LENGTH}
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
          onClick={submitForm}
          disabled={isPending || !dirty}
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
