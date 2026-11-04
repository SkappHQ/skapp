import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import { useContactLookup } from "~community/crm/hooks/useContactLookup";
import { useCrmStore } from "~community/crm/store/store";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import {
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/utils/contactUtil";
import { isDealMatchingCompany } from "~community/crm/utils/dealUtil";

interface Props {
  id: string;
  formik: FormikProps<CrmLogCallFormValues>;
  onDealCleared: () => void;
}

const LogCallContactField: FC<Props> = ({ id, formik, onDealCleared }) => {
  const { values, errors, touched, setFieldValue } = formik;

  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator("crmAria", "activities");

  const { contacts, deals, setContacts } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      deals: store.deals,
      setContacts: store.setContacts
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const { isSearchActive, isLoading, lookupItems, dropdownItems } =
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
  };

  const handleClear = (): void => {
    setFieldValue("contactId", null);
    setSearchTerm("");
  };

  return (
    <SelectableSearchField
      positionStrategy="fixed"
      id={id}
      label={translateText(["logCall", "modal", "labels", "contact"])}
      placeholder={translateText(["logActivity", "placeholders", "contact"])}
      selectedValue={
        selectedContact ? getContactDisplayName(selectedContact) : ""
      }
      onClear={handleClear}
      clearAriaLabel={translateAria(["logActivity", "clearContact"])}
      fieldAriaLabel={translateAria(["logCall", "modal", "contact"])}
      searchValue={searchTerm}
      onSearchChange={(event) => setSearchTerm(event.target.value)}
      items={dropdownItems}
      onSelect={handleSelect}
      isOpenOnFocus={isSearchActive}
      emptyMessage={translateText(["logActivity", "emptyStates", "noContacts"])}
      {...(isLoading && {
        loadingMessage: translateText([
          "logActivity",
          "emptyStates",
          "searching"
        ])
      })}
      required
      errorMessage={touched.contactId ? errors.contactId : ""}
    />
  );
};

export default LogCallContactField;
