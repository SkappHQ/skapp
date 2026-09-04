import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { isValidEmail } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  useGetCompanyLookup,
  useSearchCompaniesByDomain
} from "~community/crm/v2/api/CompanyApi";
import { useCheckContactEmailExists } from "~community/crm/v2/api/ContactApi";
import AddNewCompanyOption from "~community/crm/v2/components/atoms/AddNewCompanyOption/AddNewCompanyOption";
import SuggestedBadge from "~community/crm/v2/components/atoms/SuggestedBadge/SuggestedBadge";
import EditableContactOwnerField from "~community/crm/v2/components/molecules/EditableContactOwnerField/EditableContactOwnerField";
import SelectedOwnerField from "~community/crm/v2/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/v2/constants/commonConstants";
import {
  ADD_NEW_COMPANY_OPTION_ID,
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_NUMBER_MAX_LENGTH
} from "~community/crm/v2/constants/contactConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmCompanyFilterRequest } from "~community/crm/v2/types/CrmTypes";
import { getOwnerById } from "~community/crm/v2/utils/commonUtil";
import { getCompanyById } from "~community/crm/v2/utils/companyUtil";
import {
  getCompanyOptions,
  getEmailDomain
} from "~community/crm/v2/utils/contactUtil";

interface ContactModalFormProps {
  formik: FormikProps<CrmContactEntity>;
  isPending: boolean;
  translateText: TranslatorFunctionType;
  originalEmail?: string;
  canAddNewCompany?: boolean;
  onCancel: () => void;
}

const ContactModalForm: FC<ContactModalFormProps> = ({
  formik,
  isPending,
  translateText,
  originalEmail,
  canAddNewCompany,
  onCancel
}) => {
  const { isCrmSalesManager: canEditOwner } = useSessionData();

  const [companySearchText, setCompanySearchText] = useState("");

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    dirty,
    setFieldValue,
    submitForm
  } = formik;

  const { companies, owners } = useCrmStoreV2(
    useShallow((store) => ({
      companies: store.companies,
      owners: store.owners
    }))
  );

  const debouncedCompanySearch = useDebounce(
    companySearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const trimmedEmail = values.email?.trim() ?? "";
  const debouncedEmail = useDebounce(trimmedEmail, SEARCH_DEBOUNCE_DELAY);

  const isEmailChanged = trimmedEmail !== originalEmail?.trim();

  const isEmailCheckEnabled =
    debouncedEmail.length > 0 &&
    isValidEmail().test(debouncedEmail) &&
    isEmailChanged;

  const { data: emailExistsData, isFetching: isEmailCheckFetching } =
    useCheckContactEmailExists(debouncedEmail, isEmailCheckEnabled);

  const isDuplicateEmail = isEmailChanged && emailExistsData?.isExists;

  const isEmailCheckUnresolved =
    isEmailChanged && (trimmedEmail !== debouncedEmail || isEmailCheckFetching);

  const emailDomain = getEmailDomain(debouncedEmail);

  const { data: domainSearchData } = useSearchCompaniesByDomain(
    emailDomain,
    emailDomain.length > 0
  );

  const companyLookupFilters: CrmCompanyFilterRequest = {
    searchKeyword: debouncedCompanySearch,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };

  const { data: companyLookupData } = useGetCompanyLookup(companyLookupFilters);

  const trimmedCompanySearch = companySearchText.trim();

  const companyDropdownItems: SearchableDropdownItem[] = getCompanyOptions(
    companyLookupData?.items,
    domainSearchData?.companies,
    canAddNewCompany === true ? companySearchText : undefined
  ).map((option) => ({
    id: option.id,
    content:
      option.id === ADD_NEW_COMPANY_OPTION_ID ? (
        <AddNewCompanyOption
          label={translateText(["labels", "addNewCompany"], {
            companyName: trimmedCompanySearch
          })}
        />
      ) : option.isSuggested ? (
        <SuggestedBadge label={translateText(["labels", "suggested"])}>
          {option.name}
        </SuggestedBadge>
      ) : (
        option.name
      )
  }));

  const selectedCompanyName =
    values.companyName === undefined && values.companyId != null
      ? getCompanyById(companies, values.companyId)?.name
      : values.companyName;
  const selectedOwner = getOwnerById(owners, values.ownerId);

  const handleCompanySelect = (item: SearchableDropdownItem) => {
    if (item.id === ADD_NEW_COMPANY_OPTION_ID) {
      setFieldValue("companyName", trimmedCompanySearch);
      setCompanySearchText("");
      return;
    }

    setFieldValue("companyId", Number(item.id));
    setFieldValue("companyName", undefined);
    setCompanySearchText("");
  };

  const handleClearCompany = () => {
    setFieldValue("companyId", null);
    setFieldValue("companyName", undefined);
    setCompanySearchText("");
  };

  const emailFieldError = touched.email ? errors.email : undefined;

  const emailError = isDuplicateEmail
    ? translateText(["validations", "emailExists"])
    : emailFieldError;

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={touched.name ? errors.name : undefined}
        state={touched.name && errors.name ? "error" : "default"}
        label={translateText(["labels", "name"])}
        placeholder={translateText(["placeholders", "name"])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "name"])}
        maxLength={CONTACT_NAME_MAX_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="email"
        value={values.email}
        errorMessage={emailError}
        state={emailError ? "error" : "default"}
        label={translateText(["labels", "email"])}
        placeholder={translateText(["placeholders", "email"])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "email"])}
        maxLength={CONTACT_EMAIL_MAX_LENGTH}
        required
        fullWidth
      />

      {values.companyId == null && values.companyName === undefined ? (
        <SearchableDropdown
          id="contact-company"
          name="company"
          label={translateText(["labels", "company"])}
          placeholder={translateText(["placeholders", "company"])}
          items={companyDropdownItems}
          value={companySearchText}
          onChange={(event) => setCompanySearchText(event.target.value)}
          onSelect={handleCompanySelect}
          onClose={() => setCompanySearchText("")}
          isOpenOnFocus={true}
        />
      ) : (
        <InputField
          label={translateText(["labels", "company"])}
          value={selectedCompanyName}
          readOnly
          fullWidth
          variant="md"
          styleOverrides={{
            labelContainer:
              "h-6 inline-flex self-stretch pr-3 justify-start items-center gap-2"
          }}
          customStyles={{ gap: "gap-2" }}
          aria-label={translateText(["ariaLabels", "company"])}
          rightIcon={
            <ButtonV2
              variant="tertiary"
              type="button"
              onClick={handleClearCompany}
              aria-label={translateText(["ariaLabels", "clearCompany"])}
              icon={<CloseIcon />}
            />
          }
        />
      )}

      <InputField
        name="contactNumber"
        value={values.contactNumber}
        errorMessage={touched.contactNumber ? errors.contactNumber : undefined}
        state={
          touched.contactNumber && errors.contactNumber ? "error" : "default"
        }
        label={translateText(["labels", "contactNumber"])}
        placeholder={translateText(["placeholders", "contactNumber"])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "contactNumber"])}
        maxLength={CONTACT_NUMBER_MAX_LENGTH}
        fullWidth
      />

      {canEditOwner ? (
        <EditableContactOwnerField
          ownerId={values.ownerId}
          errorMessage={touched.ownerId ? errors.ownerId : undefined}
          translateText={translateText}
          onChange={(owner) => setFieldValue("ownerId", owner?.employeeId)}
        />
      ) : (
        selectedOwner && (
          <SelectedOwnerField
            label={translateText(["labels", "owner"])}
            owner={selectedOwner}
            onRemove={() => setFieldValue("ownerId", undefined)}
            showRemoveButton={false}
            ariaLabel={translateText(["ariaLabels", "clearOwner"])}
          />
        )
      )}

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
          disabled={isPending || !dirty}
          isLoading={isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ContactModalForm;
