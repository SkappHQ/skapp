import { FormikProps } from "formik";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetContactLookup } from "~community/crm/api/ContactApi";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import { CrmContactFilterRequest } from "~community/crm/types/CrmTypes";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";
import {
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/utils/contactUtil";

interface Props {
  id: string;
  formik: FormikProps<CrmLogCallFormValues>;
  onDealCleared: () => void;
}

const LogCallContactField: FC<Props> = ({ id, formik, onDealCleared }) => {
  const { values, errors, touched, setFieldValue } = formik;

  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logCall",
    "modal"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logCall",
    "modal"
  );

  const { contacts, deals, companies, setContacts, setCompanies } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      deals: store.deals,
      companies: store.companies,
      setContacts: store.setContacts,
      setCompanies: store.setCompanies
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [hasFilledRelatedTo, setHasFilledRelatedTo] = useState(false);

  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const lookupFilter: CrmContactFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      size: DEFAULT_LOOKUP_PAGE_SIZE
    }),
    [debouncedSearch]
  );

  const { data: lookupData } = useGetContactLookup(
    lookupFilter,
    debouncedSearch.length > 0
  );

  const lookupItems = useMemo(
    () => (lookupData ? lookupData.items : []),
    [lookupData]
  );

  const dropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      lookupItems.map((contact) => {
        const contactName = getContactDisplayName(contact);
        return {
          id: String(contact.id),
          content: (
            <div className="w-full truncate" title={contactName}>
              {contactName}
            </div>
          )
        };
      }),
    [lookupItems]
  );

  const selectedContact = values.contactId ? contacts[values.contactId] : null;

  const handleSelect = (item: SearchableDropdownItem): void => {
    const contact = lookupItems.find(
      (lookupContact) => String(lookupContact.id) === item.id
    );
    setSearchTerm("");

    if (!contact || !contact.id) return;

    setContacts(updateContactRecord(contacts, [contact]));
    setFieldValue("contactId", contact.id);

    const selectedDeal = values.dealId ? deals[values.dealId] : null;
    const isDealMismatch =
      selectedDeal &&
      (selectedDeal.companyId
        ? selectedDeal.companyId !== contact.companyId
        : Boolean(contact.companyId));

    if (isDealMismatch) {
      setFieldValue("dealId", null);
      onDealCleared();
    }

    if (!hasFilledRelatedTo && !values.companyId && contact.companyId) {
      setCompanies(
        updateCompanyRecord(companies, [
          { id: contact.companyId, name: contact.companyName }
        ])
      );
      setFieldValue("companyId", contact.companyId);
      setHasFilledRelatedTo(true);
    }
  };

  const handleClear = (): void => {
    setFieldValue("contactId", null);
    setSearchTerm("");
  };

  return (
    <SelectableSearchField
      id={id}
      label={translateText(["labels", "contact"])}
      placeholder={translateText(["placeholders", "contact"])}
      selectedValue={
        selectedContact ? getContactDisplayName(selectedContact) : ""
      }
      onClear={handleClear}
      clearAriaLabel={translateAria(["clearContact"])}
      fieldAriaLabel={translateAria(["contact"])}
      searchValue={searchTerm}
      onSearchChange={(event) => setSearchTerm(event.target.value)}
      items={dropdownItems}
      onSelect={handleSelect}
      isOpenOnFocus={debouncedSearch.length > 0}
      emptyMessage={translateText(["emptyStates", "noContacts"])}
      required
      errorMessage={touched.contactId ? errors.contactId : ""}
    />
  );
};

export default LogCallContactField;
