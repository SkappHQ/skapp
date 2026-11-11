import {
  AutoCompleteDropdown,
  AutoCompleteDropdownProps,
  AvatarChip,
  AvatarGroup
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetContactLookup } from "~community/crm/api/ContactApi";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmContactEntity } from "~community/crm/types/CrmCommonTypes";
import {
  getContactCompanyName,
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/utils/contactUtil";

type SelectableContact = NonNullable<
  AutoCompleteDropdownProps["selectableResults"]
>[number];

interface Props {
  id: string;
  title: string;
  selectedLabel: string;
  searchPlaceholder: string;
  editAriaLabel: string;
  emptyLabel: string;
  isRequired?: boolean;
  contactIds: number[];
  onChange: (contactIds: number[]) => void;
}

const SidePanelContactsField: FC<Props> = ({
  id,
  title,
  selectedLabel,
  searchPlaceholder,
  editAriaLabel,
  emptyLabel,
  isRequired = false,
  contactIds,
  onChange
}) => {
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  const { contacts, setContacts, companies } = useCrmStore(
    useShallow((state) => ({
      contacts: state.contacts,
      setContacts: state.setContacts,
      companies: state.companies
    }))
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<number[]>(contactIds);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const { data: lookupData } = useGetContactLookup({
    searchKeyword: debouncedSearch,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  });

  const lookupItems = useMemo(
    () => (lookupData ? lookupData.items : []),
    [lookupData]
  );

  const toContacts = (ids: number[]): CrmContactEntity[] =>
    ids.flatMap((contactId) =>
      contacts[contactId] ? [contacts[contactId]] : []
    );

  const selectedContacts = toContacts(contactIds);

  const applyChanges = (): void => {
    setIsOpen(false);
    setSearchTerm("");

    const isChanged =
      pendingIds.length !== contactIds.length ||
      pendingIds.some((contactId) => !contactIds.includes(contactId));

    if (isChanged && (!isRequired || pendingIds.length > 0)) {
      onChange(pendingIds);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        applyChanges();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, pendingIds]);

  const handleOpen = (): void => {
    setPendingIds(contactIds);
    setIsOpen(true);
  };

  const listedContacts = [
    ...toContacts(pendingIds),
    ...lookupItems.filter(
      (contact) => contact.id && !pendingIds.includes(contact.id)
    )
  ];

  const selectableResults: SelectableContact[] = listedContacts.flatMap(
    (contact) => {
      if (!contact.id) return [];

      const contactName = getContactDisplayName(contact);
      const companyName = getContactCompanyName(contact, companies);

      return [
        {
          id: String(contact.id),
          isSelected: pendingIds.includes(contact.id),
          ariaLabel: contactName,
          content: (
            <span className="flex flex-col min-w-0">
              <span className="body2 truncate">{contactName}</span>
              {companyName && (
                <span className="subtitle4 truncate text-secondary-text">
                  {companyName}
                </span>
              )}
            </span>
          )
        }
      ];
    }
  );

  const handleItemSelect = (item: SelectableContact): void => {
    const selectedId = Number(item.id);
    if (pendingIds.includes(selectedId)) return;

    const contact = lookupItems.find(
      (lookupContact) => lookupContact.id === selectedId
    );
    if (contact) {
      setContacts(updateContactRecord(contacts, [contact]));
    }
    setPendingIds([...pendingIds, selectedId]);
  };

  const handleItemDeselect = (item: SelectableContact): void => {
    setPendingIds(
      pendingIds.filter((contactId) => contactId !== Number(item.id))
    );
  };

  const toAvatar = (contact: CrmContactEntity) => {
    const [firstName, lastName] = getContactDisplayName(contact).split(" ");

    return {
      id: String(contact.id),
      firstName,
      lastName,
      title: getContactDisplayName(contact),
      size: "xs" as const
    };
  };

  return (
    <div ref={wrapperRef} className="relative self-stretch">
      <button
        id={id}
        type="button"
        aria-label={editAriaLabel}
        className={`flex flex-col gap-2 w-full text-left border border-secondary-accent rounded-xl p-3 cursor-pointer hover:bg-secondary-background ${
          isOpen ? "invisible" : ""
        }`}
        onClick={handleOpen}
      >
        <span className="subtitle1">{title}</span>
        {selectedContacts.length === 0 && (
          <span className="body2">{emptyLabel}</span>
        )}
        {selectedContacts.length > 2 ? (
          <AvatarGroup
            avatars={selectedContacts.map(toAvatar)}
            maxVisible={20}
            showRemainingCount
          />
        ) : (
          <span className="flex w-full min-w-0 items-center gap-2">
            {selectedContacts.map((contact) => (
              <span key={contact.id} className="min-w-0 max-w-max flex-1">
                <AvatarChip
                  label={getContactDisplayName(contact)}
                  avatarProps={toAvatar(contact)}
                  showActionButton={false}
                />
              </span>
            ))}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-0 z-50">
          <AutoCompleteDropdown
            multiSelect
            isOpen
            className="w-full"
            label={title}
            placeholder={searchPlaceholder}
            selectedItemsLabel={selectedLabel}
            selectableResults={selectableResults}
            maxHeight="250px"
            onSearch={setSearchTerm}
            onItemSelect={handleItemSelect}
            onItemDeselect={handleItemDeselect}
            onClose={applyChanges}
            accessibilityTexts={{
              dropdownClosedText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "dropdownClosedText"
              ]),
              focusReturnedText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "focusReturnedText"
              ]),
              itemText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "itemText"
              ]),
              noMoreItemsText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "noMoreItemsText"
              ]),
              noResultsFoundText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "noResultsFoundText"
              ]),
              removedText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "removedText"
              ]),
              resultAvailableText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "resultAvailableText"
              ]),
              resultsAvailableText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "resultsAvailableText"
              ]),
              selectedText: translateAria([
                "contactsDropdown",
                "accessibilityTexts",
                "selectedText"
              ])
            }}
            ariaLabels={{
              availableOptionsAriaLabel: translateAria([
                "contactsDropdown",
                "ariaLabels",
                "availableOptionsAriaLabel"
              ]),
              searchResultsAriaLabel: translateAria([
                "contactsDropdown",
                "ariaLabels",
                "searchResultsAriaLabel"
              ]),
              selectedItemsAriaLabel: translateAria([
                "contactsDropdown",
                "ariaLabels",
                "selectedItemsAriaLabel"
              ]),
              selectedItemsRemoveAriaLabel: translateAria([
                "contactsDropdown",
                "ariaLabels",
                "selectedItemsRemoveAriaLabel"
              ]),
              removeItemAriaLabel: translateAria([
                "contactsDropdown",
                "ariaLabels",
                "removeItemAriaLabel"
              ])
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SidePanelContactsField;
