import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useGetCompaniesByIds } from "~community/crm/v2/api/CompanyApi";
import { useGetContactLookupV2 } from "~community/crm/v2/api/ContactApi";
import ContactPopupSearch from "~community/crm/v2/components/molecules/ContactPopupSearch/ContactPopupSearch";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getMissingCompanyIds,
  mergeCompanies
} from "~community/crm/v2/utils/companyUtil";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

import EditableCell from "./EditableCell";

interface Props {
  contactId?: number;
  companyId?: number;
  onSave: (contact: CrmContactEntity) => void;
}

const DealContactCell: FC<Props> = ({ contactId, companyId, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { contactRecord, companies } = useCrmStoreV2(
    useShallow((store) => ({
      contactRecord: store.contacts,
      companies: store.companies
    }))
  );

  const debouncedSearchTerm = useDebounce(
    searchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: contactLookupData } = useGetContactLookupV2(
    debouncedSearchTerm,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isEditing && debouncedSearchTerm.length > 0
  );
  const contacts = useMemo(
    () => contactLookupData?.items ?? [],
    [contactLookupData?.items]
  );

  const missingCompanyIds = useMemo(
    () =>
      getMissingCompanyIds(
        contacts
          .map((contact) => contact.companyId)
          .filter((id): id is number => id != null),
        companies
      ),
    [contacts, companies]
  );
  const { data: fetchedCompanies } = useGetCompaniesByIds(
    missingCompanyIds,
    missingCompanyIds.length > 0
  );
  useEffect(() => {
    if (fetchedCompanies && fetchedCompanies.length > 0) {
      const store = useCrmStoreV2.getState();
      store.setCompanies(mergeCompanies(store.companies, fetchedCompanies));
    }
  }, [fetchedCompanies]);

  const contactName = getContactDisplayName(
    contactId != null ? contactRecord[contactId] : undefined
  );

  const selectedContact =
    contactId != null ? { id: contactId, name: contactName, companyId } : null;

  const handleChange = (contact: CrmContactEntity | null): void => {
    setIsEditing(false);
    if (contact && contact.id !== contactId) {
      onSave(contact);
    }
  };

  return (
    <EditableCell
      isEditing={isEditing}
      ariaLabel={translateText(["inlineEdit", "ariaLabels", "contactName"])}
      onStartEditing={() => setIsEditing(true)}
      onClickOutside={() => setIsEditing(false)}
      display={
        <span className="body2 block w-full truncate" title={contactName}>
          {contactName || "-"}
        </span>
      }
    >
      <ContactPopupSearch
        contacts={contacts}
        companies={companies}
        selectedContact={selectedContact}
        onChange={handleChange}
        onSearch={setSearchTerm}
        placeholder={translateText(["inlineEdit", "placeholders", "none"])}
        searchPlaceholder={translateText([
          "inlineEdit",
          "placeholders",
          "contactSearch"
        ])}
        noResultsText={translateText([
          "inlineEdit",
          "placeholders",
          "noResults"
        ])}
      />
    </EditableCell>
  );
};

export default DealContactCell;
