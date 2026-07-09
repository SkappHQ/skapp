import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCrmContacts } from "~community/crm/api/ContactApi";
import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyField from "~community/crm/components/molecules/PropertyField/PropertyField";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetMappedDealStages from "~community/crm/hooks/useGetMappedDealStages";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactLookup,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { validateDealAmount } from "~community/crm/utils/dealValidations";

interface DealPropertiesSidebarProps {
  isOpen?: boolean;
  onStageChange: (stageId: number) => void;
  onAmountChange: (amount: string) => void;
  onPriorityChange: (priority: CrmPriorityEnum) => void;
  onOwnerChange: (owner: CrmOwner) => void;
  onContactChange: (contact: CrmContactLookup) => void;
}

const DealPropertiesSidebar: FC<DealPropertiesSidebarProps> = ({
  isOpen,
  onStageChange,
  onAmountChange,
  onPriorityChange,
  onOwnerChange,
  onContactChange
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const { selectedDealId, getDealById } = useCrmStore((store) => ({
    selectedDealId: store.selectedDealId,
    getDealById: store.getDealById
  }));
  const deal = getDealById(selectedDealId!)!;

  const selectedStageId = String(deal.stage.id);
  const selectedOwner = deal.owner;
  const selectedContact: CrmContactLookup | null = deal.contactId
    ? { id: deal.contactId, name: deal.contactName ?? "" }
    : null;

  const [contactSearchTerm, setContactSearchTerm] = useState<string>("");

  const debouncedContactSearchTerm = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearchTerm,
    DEFAULT_LOOKUP_PAGE_SIZE,
    debouncedContactSearchTerm.length > 0
  );
  const contacts = contactLookupData?.items ?? [];

  const { dealStages, isLoading: isStagesLoading } = useGetMappedDealStages();

  const stageOptions = useMemo(
    () =>
      dealStages.map((stage) => ({
        id: String(stage.id),
        value: String(stage.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: STAGE_COLOR_MAP[stage.color] }}
            />
            <span className="body2">{stage.name}</span>
          </div>
        )
      })),
    [dealStages]
  );

  return (
    <div className="w-1/3 flex flex-col gap-4 shrink-0">
      {isStagesLoading ? (
        <SkeletonShape className="h-9 w-full" />
      ) : (
        <Dropdown
          options={stageOptions}
          value={selectedStageId}
          onChange={(value) => {
            if (value !== selectedStageId) {
              onStageChange(Number(value));
            }
          }}
          variant="primary"
          className="rounded-lg"
          width="55%"
          placeholder={translateText(["placeholders", "stage"])}
          ariaLabel={translateText(["ariaLabels", "stage"])}
        />
      )}

      <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
        <PropertyRow label={translateText(["contact"])}>
          <div className="flex flex-col w-full">
            <ContactPopupSearch
              contacts={contacts}
              selectedContact={selectedContact}
              onChange={(contact) => {
                if (contact && contact.id !== selectedContact?.id) {
                  onContactChange(contact);
                }
              }}
              onSearch={setContactSearchTerm}
              placeholder={translateText(["placeholders", "none"])}
              searchPlaceholder={translateText([
                "placeholders",
                "contactSearch"
              ])}
              noResultsText={translateText(["placeholders", "noResults"])}
            />
          </div>
        </PropertyRow>

        <PropertyField
          label={translateText(["value"])}
          value={deal.amount ?? ""}
          placeholder={translateText(["placeholders", "none"])}
          validate={(value) => validateDealAmount(value, translateText)}
          onSave={onAmountChange}
        />

        <PropertyRow label={translateText(["priority"])}>
          <PriorityDropdown
            value={deal.priority}
            onChange={(value) => {
              if (value !== deal.priority) {
                onPriorityChange(value);
              }
            }}
          />
        </PropertyRow>

        <PropertyRow label={translateText(["ownedBy"])}>
          <div className="flex flex-col w-full">
            <OwnerPopupSearch
              selectedUser={selectedOwner}
              onChange={(owner) => {
                if (owner && owner.employeeId !== selectedOwner.employeeId) {
                  setSelectedOwner(owner);
                  onOwnerChange(owner);
                }
              }}
              placeholder={translateText(["placeholders", "none"])}
              searchPlaceholder={translateText(["placeholders", "ownerSearch"])}
              noResultsText={translateText(["placeholders", "noResults"])}
            />
          </div>
        </PropertyRow>
      </div>
    </div>
  );
};

export default DealPropertiesSidebar;
