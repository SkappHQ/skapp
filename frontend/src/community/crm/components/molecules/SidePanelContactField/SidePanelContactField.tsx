import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetContactLookup } from "~community/crm/api/ContactApi";
import SidePanelLinkPopupField from "~community/crm/components/molecules/SidePanelLinkPopupField/SidePanelLinkPopupField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  buildContactOptions,
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/utils/contactUtil";

interface Props {
  id: string;
  contactId: number | null;
  emptyLabel: string;
  editAriaLabel: string;
  onContactClick: (contactId: number) => void;
  onChange: (contactId: number, contactCompanyId?: number | null) => void;
}

const SidePanelContactField: FC<Props> = ({
  id,
  contactId,
  emptyLabel,
  editAriaLabel,
  onContactClick,
  onChange
}) => {
  const translateText = useTranslator("crmModule", "activities", "logActivity");

  const { contacts, setContacts, companies } = useCrmStore(
    useShallow((state) => ({
      contacts: state.contacts,
      setContacts: state.setContacts,
      companies: state.companies
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const { data: lookupData } = useGetContactLookup(
    { searchKeyword: debouncedSearch, size: DEFAULT_LOOKUP_PAGE_SIZE },
    debouncedSearch.length > 0
  );

  const lookupItems = useMemo(
    () => (lookupData ? lookupData.items : []),
    [lookupData]
  );

  const selectedContact = contactId ? contacts[contactId] : null;

  const handleSelect = (selectedId: number): void => {
    const contact = lookupItems.find((item) => item.id === selectedId);
    setSearchTerm("");

    if (!contact) return;

    setContacts(updateContactRecord(contacts, [contact]));
    onChange(selectedId, contact.companyId);
  };

  const handleLinkClick = (): void => {
    if (contactId) onContactClick(contactId);
  };

  return (
    <SidePanelLinkPopupField
      id={id}
      options={buildContactOptions(lookupItems, companies)}
      selectedId={selectedContact ? contactId : null}
      linkLabel={selectedContact ? getContactDisplayName(selectedContact) : ""}
      emptyLabel={emptyLabel}
      editAriaLabel={editAriaLabel}
      searchPlaceholder={translateText(["placeholders", "contact"])}
      noResultsText={translateText(["emptyStates", "noContacts"])}
      onLinkClick={handleLinkClick}
      onSearch={setSearchTerm}
      onSelect={handleSelect}
    />
  );
};

export default SidePanelContactField;
