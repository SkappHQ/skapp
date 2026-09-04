import { FormikProps } from "formik";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import SelectableSearchField from "~community/common/components/molecules/SelectableSearchField/SelectableSearchField";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useGetContactLookupV2 } from "~community/crm/v2/api/ContactApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmContactFilterRequest,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import {
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/v2/utils/contactUtil";

interface Props {
  formik: FormikProps<CrmTaskEntity>;
}

const TaskContactField: FC<Props> = ({ formik }) => {
  const { values, setFieldValue } = formik;

  const translateText = useTranslator("crmModule", "tasks", "taskModal");

  const {
    contacts,
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedCompanyId,
    setContacts
  } = useCrmStoreV2(
    useShallow((store) => ({
      contacts: store.contacts,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      selectedCompanyId: store.selectedCompanyId,
      setContacts: store.setContacts
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(
    searchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const companyScopeId =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL
      ? (selectedCompanyId ?? undefined)
      : undefined;

  const lookupCompanyId =
    values.contactId != null ? undefined : companyScopeId;

  const isSearchEnabled =
    debouncedSearch.length > 0 ||
    values.dealId != null ||
    lookupCompanyId != null;

  const lookupFilter: CrmContactFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      size: DEFAULT_LOOKUP_PAGE_SIZE,
      dealId: values.dealId,
      companyId: lookupCompanyId
    }),
    [debouncedSearch, values.dealId, lookupCompanyId]
  );

  const { data: lookupData } = useGetContactLookupV2(
    lookupFilter,
    isSearchEnabled
  );

  const lookupItems = useMemo(
    () => lookupData?.items ?? [],
    [lookupData?.items]
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

  const selectedContact =
    values.contactId != null ? contacts[values.contactId] : undefined;

  const handleSelect = (item: SearchableDropdownItem) => {
    const contact = lookupItems.find(
      (lookupContact) => String(lookupContact.id) === item.id
    );
    if (contact) setContacts(updateContactRecord(contacts, [contact]));

    setFieldValue("contactId", contact?.id);
    setSearchTerm("");
  };

  const handleClear = () => {
    setFieldValue("contactId", null);
    setSearchTerm("");
  };

  return (
    <SelectableSearchField
      id="contact-search"
      label={translateText(["labels", "contactName"])}
      placeholder={translateText(["placeholders", "contactName"])}
      selectedValue={getContactDisplayName(selectedContact)}
      onClear={handleClear}
      clearAriaLabel={translateText(["ariaLabels", "clearContact"])}
      fieldAriaLabel={translateText(["ariaLabels", "contactName"])}
      searchValue={searchTerm}
      onSearchChange={(event) => setSearchTerm(event.target.value)}
      items={dropdownItems}
      onSelect={handleSelect}
      isOpenOnFocus={isSearchEnabled}
      emptyMessage={translateText(["emptyStates", "noContacts"])}
    />
  );
};

export default TaskContactField;
