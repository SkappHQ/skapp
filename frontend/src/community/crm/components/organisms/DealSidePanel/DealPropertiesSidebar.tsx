import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCrmContacts } from "~community/crm/api/ContactApi";
import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import StageLabel from "~community/crm/components/atoms/StageLabel/StageLabel";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyField from "~community/crm/components/molecules/PropertyField/PropertyField";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetMappedDealStages from "~community/crm/hooks/useGetMappedDealStages";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactLookup,
  CrmContactLookupParams,
  CrmDealContactType,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { validateDealAmount } from "~community/crm/utils/dealValidations";

interface DealPropertiesSidebarProps {
  onStageChange: (stageId: number) => void;
  onAmountChange: (amount: string) => void;
  onPriorityChange: (priority: CrmPriorityEnum) => void;
  onOwnerChange: (owner: CrmOwner) => void;
  onContactChange: (contact: CrmContactLookup) => void;
}

const DealPropertiesSidebar: FC<DealPropertiesSidebarProps> = ({
  onStageChange,
  onAmountChange,
  onPriorityChange,
  onOwnerChange,
  onContactChange
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const { selectedDealId, getDealById } = useCrmStore(
    useShallow((store) => ({
      selectedDealId: store.selectedDealId,
      getDealById: store.getDealById
    }))
  );
  const deal = getDealById(selectedDealId!)!;

  const selectedStageId = String(deal.stage.id);
  const selectedOwner = deal.owner;
  const selectedContact: CrmDealContactType | null = deal.contactId
    ? {
        id: deal.contactId,
        name: deal.contactName ?? "",
        companyName: deal.companyName ?? null
      }
    : null;

  const [contactSearchTerm, setContactSearchTerm] = useState<string>("");

  const debouncedContactSearchTerm = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const contactLookupParams: CrmContactLookupParams = {
    searchKeyword: debouncedContactSearchTerm,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };
  const { data: contactLookupData } = useGetCrmContacts(
    contactLookupParams,
    debouncedContactSearchTerm.length > 0
  );
  const contacts = contactLookupData?.items ?? [];

  const { dealStages, isLoading: isStagesLoading } = useGetMappedDealStages();

  const stageOptions = useMemo(
    () =>
      dealStages.map((stage) => ({
        id: String(stage.id),
        value: String(stage.id),
        label: <StageLabel label={stage?.name} color={stage?.color} />
      })),
    [dealStages]
  );

  const handleStageChange = (value: string): void => {
    if (value !== selectedStageId) {
      onStageChange(Number(value));
    }
  };

  const handleContactChange = (contact: CrmContactLookup | null): void => {
    if (contact && contact.id !== deal.contactId) {
      onContactChange(contact);
    }
  };

  const handlePriorityChange = (value: CrmPriorityEnum): void => {
    if (value !== deal.priority) {
      onPriorityChange(value);
    }
  };

  const handleOwnerChange = (owner: CrmOwner | null): void => {
    if (owner && owner.employeeId !== selectedOwner.employeeId) {
      onOwnerChange(owner);
    }
  };

  return (
    <div className="w-1/3 flex flex-col gap-4 shrink-0">
      <div className="w-full max-w-[13.688rem]">
        {isStagesLoading ? (
          <SkeletonShape className="h-12 w-full" />
        ) : (
          <Dropdown
            options={stageOptions}
            value={selectedStageId}
            onChange={handleStageChange}
            variant="primary"
            className="rounded-lg"
            width="100%"
            placeholder={translateText(["placeholders", "stage"])}
            ariaLabel={translateText(["ariaLabels", "stage"])}
          />
        )}
      </div>

      <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
        <PropertyRow label={translateText(["contact"])} required>
          <div className="flex flex-col w-full">
            <ContactPopupSearch
              contacts={contacts}
              selectedContact={selectedContact}
              onChange={handleContactChange}
              onSearch={setContactSearchTerm}
              ariaRequired
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
          ariaLabel={translateText(["ariaLabels", "amount"])}
          validate={(value) => validateDealAmount(value, translateText)}
          onSave={onAmountChange}
        />

        <PropertyRow label={translateText(["priority"])}>
          <PriorityDropdown
            value={deal.priority}
            onChange={handlePriorityChange}
          />
        </PropertyRow>

        <PropertyRow label={translateText(["ownedBy"])}>
          <div className="flex flex-col w-full">
            <OwnerPopupSearch
              selectedUser={selectedOwner}
              onChange={handleOwnerChange}
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
