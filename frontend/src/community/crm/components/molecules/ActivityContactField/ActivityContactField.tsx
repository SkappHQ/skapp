import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import { useContactLookup } from "~community/crm/hooks/useContactLookup";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmAddTaskFormValues,
  CrmLogCallFormValues
} from "~community/crm/types/CrmCommonTypes";
import {
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/utils/contactUtil";
import { isDealMatchingCompany } from "~community/crm/utils/dealUtil";

interface Props {
  id: string;
  formik: FormikProps<CrmLogCallFormValues> | FormikProps<CrmAddTaskFormValues>;
  label: string;
  fieldAriaLabel: string;
  onDealCleared: () => void;
  required?: boolean;
  errorMessage?: string;
}

const ActivityContactField: FC<Props> = ({
  id,
  formik,
  label,
  fieldAriaLabel,
  onDealCleared,
  required,
  errorMessage
}) => {
  const { values, setFieldValue } = formik;

  const translateText = useTranslator("crmModule", "activities", "logActivity");
  const translateAria = useTranslator("crmAria", "activities", "logActivity");

  const { contacts, deals, setContacts } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      deals: store.deals,
      setContacts: store.setContacts
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [hasFilledRelatedTo, setHasFilledRelatedTo] = useState(false);

  const { isSearchActive, lookupItems, dropdownItems } =
    useContactLookup(searchTerm);

  const selectedContact = values.contactId ? contacts[values.contactId] : null;

  const handleSelect = (item: SearchableDropdownItem): void => {
    const contact = lookupItems.find(
      (lookupContact) => String(lookupContact.id) === item.id
    );
    setSearchTerm("");

    if (!contact?.id) return;

    setContacts(updateContactRecord(contacts, [contact]));
    setFieldValue("contactId", contact.id);

    const selectedDeal = values.dealId ? deals[values.dealId] : null;
    const isDealMismatch =
      selectedDeal && !isDealMatchingCompany(selectedDeal, contact.companyId);

    if (isDealMismatch) {
      setFieldValue("dealId", null);
      onDealCleared();
    }

    if (!hasFilledRelatedTo && !values.companyId && contact.companyId) {
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
      positionStrategy="fixed"
      id={id}
      label={label}
      placeholder={translateText(["placeholders", "contact"])}
      selectedValue={
        selectedContact ? getContactDisplayName(selectedContact) : ""
      }
      onClear={handleClear}
      clearAriaLabel={translateAria(["clearContact"])}
      fieldAriaLabel={fieldAriaLabel}
      searchValue={searchTerm}
      onSearchChange={(event) => setSearchTerm(event.target.value)}
      items={dropdownItems}
      onSelect={handleSelect}
      isOpenOnFocus={isSearchActive}
      emptyMessage={translateText(["emptyStates", "noContacts"])}
      required={required}
      errorMessage={errorMessage}
    />
  );
};

export default ActivityContactField;
