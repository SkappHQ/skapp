import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import ContactPopupSearch from "~community/crm/v2/components/molecules/ContactPopupSearch/ContactPopupSearch";
import OwnerPopupSearch from "~community/crm/v2/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/v2/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyField from "~community/crm/v2/components/molecules/PropertyField/PropertyField";
import PropertyRow from "~community/crm/v2/components/molecules/PropertyRow/PropertyRow";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useGetContactLookupV2 } from "~community/crm/v2/api/ContactApi";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useDealById, useOrderedStages } from "~community/crm/v2/store/selectors";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmContactLookupItem } from "~community/crm/v2/types/CrmTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";
import { validateDealAmount } from "~community/crm/v2/utils/dealValidations";

interface DealPropertiesSidebarProps {
  dealId: number;
  onStageChange: (stageId: number) => void;
  onAmountChange: (amount: string) => void;
  onPriorityChange: (priority: CrmPriorityEnum) => void;
  onOwnerChange: (owner: CrmOwnerEntity) => void;
  onContactChange: (contact: CrmContactLookupItem) => void;
}

const DealPropertiesSidebar: FC<DealPropertiesSidebarProps> = ({
  dealId,
  onStageChange,
  onAmountChange,
  onPriorityChange,
  onOwnerChange,
  onContactChange
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const { getStageByName } = useStageNameMapper();

  const deal = useDealById(dealId);
  const stages = useOrderedStages();

  const contactRecord = useCrmStoreV2((state) => state.contacts);
  const companies = useCrmStoreV2((state) => state.companies);
  const owners = useCrmStoreV2((state) => state.owners);

  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const debouncedContactSearchTerm = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: contactLookupData } = useGetContactLookupV2(
    debouncedContactSearchTerm,
    DEFAULT_LOOKUP_PAGE_SIZE,
    debouncedContactSearchTerm.length > 0
  );
  const contacts = contactLookupData?.items ?? [];

  const stageOptions = useMemo(
    () =>
      stages.map((stage) => ({
        id: String(stage.id),
        value: String(stage.id),
        label: (
          <StageLabel
            label={getStageByName(stage.name ?? "")}
            color={stage.color}
          />
        )
      })),
    [stages, getStageByName]
  );

  if (!deal) return null;

  const selectedStageId = deal.stageId != null ? String(deal.stageId) : "";
  const selectedOwner: CrmOwnerEntity | null =
    deal.ownerId != null ? owners[deal.ownerId] ?? null : null;
  const selectedContact: CrmContactLookupItem | null =
    deal.contactId != null
      ? {
          id: deal.contactId,
          name: getContactDisplayName(contactRecord[deal.contactId]),
          company:
            deal.companyId != null ? companies[deal.companyId] ?? null : null
        }
      : null;

  const handleStageChange = (value: string): void => {
    if (value !== selectedStageId) onStageChange(Number(value));
  };

  const handleContactChange = (contact: CrmContactLookupItem | null): void => {
    if (contact && contact.id !== deal.contactId) onContactChange(contact);
  };

  const handlePriorityChange = (value: CrmPriorityEnum): void => {
    if (value !== deal.priority) onPriorityChange(value);
  };

  const handleOwnerChange = (owner: CrmOwnerEntity | null): void => {
    if (owner && owner.employeeId !== selectedOwner?.employeeId) {
      onOwnerChange(owner);
    }
  };

  return (
    <div className="w-1/3 flex flex-col gap-4 shrink-0">
      <Dropdown
        options={stageOptions}
        value={selectedStageId}
        onChange={handleStageChange}
        variant="primary"
        className="rounded-lg"
        width="55%"
        placeholder={translateText(["placeholders", "stage"])}
        ariaLabel={translateText(["ariaLabels", "stage"])}
      />

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
            value={deal.priority ?? CrmPriorityEnum.MEDIUM}
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
