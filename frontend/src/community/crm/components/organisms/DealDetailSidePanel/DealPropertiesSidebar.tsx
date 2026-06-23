import { Dropdown, DropdownOption } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import {
  CrmContactLookup,
  CrmOwner
} from "~community/crm/types/CommonTypes";

interface DealPropertiesSidebarProps {
  isStagesLoading: boolean;
  stageOptions: DropdownOption[];
  selectedStageId: string;
  onStageChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  priority: CrmPriorityEnum;
  onPriorityChange: (value: CrmPriorityEnum) => void;
  selectedOwner: CrmOwner | null;
  onOwnerChange: (owner: CrmOwner | null) => void;
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  onContactChange: (contact: CrmContactLookup | null) => void;
  onContactSearch: (term: string) => void;
}

const DealPropertiesSidebar: FC<DealPropertiesSidebarProps> = ({
  isStagesLoading,
  stageOptions,
  selectedStageId,
  onStageChange,
  amount,
  onAmountChange,
  priority,
  onPriorityChange,
  selectedOwner,
  onOwnerChange,
  contacts,
  selectedContact,
  onContactChange,
  onContactSearch
}) => {
  const addDealTranslator = useTranslator(
    "crmModule",
    "deals",
    "addDealSidePanel"
  );

  return (
    <div className="w-1/3 flex flex-col gap-4 shrink-0">
      {isStagesLoading ? (
        <MultipleSkeletons numOfSkeletons={1} height={38} />
      ) : (
        <Dropdown
          options={stageOptions}
          value={selectedStageId}
          onChange={(v) => onStageChange(String(v))}
          variant="primary"
          className="rounded-lg"
          width="55%"
          placeholder={addDealTranslator(["placeholders", "stage"])}
          ariaLabel={addDealTranslator(["ariaLabels", "stage"])}
        />
      )}

      <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
        <PropertyRow label={addDealTranslator(["labels", "value"])}>
          <div className="flex flex-col w-full px-1">
            <input
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder={addDealTranslator(["placeholders", "none"])}
              type="text"
              className="w-full bg-transparent outline-none body2 placeholder:text-secondary-text"
              aria-label={addDealTranslator(["ariaLabels", "amount"])}
            />
          </div>
        </PropertyRow>

        <PropertyRow label={addDealTranslator(["labels", "priority"])}>
          <PriorityDropdown value={priority} onChange={onPriorityChange} />
        </PropertyRow>

        <PropertyRow label={addDealTranslator(["labels", "ownedBy"])}>
          <div className="flex flex-col w-full">
            <OwnerPopupSearch
              selectedUser={selectedOwner}
              onChange={onOwnerChange}
              placeholder={addDealTranslator(["placeholders", "none"])}
              searchPlaceholder={addDealTranslator([
                "placeholders",
                "ownerSearch"
              ])}
              noResultsText={addDealTranslator([
                "placeholders",
                "noResults"
              ])}
            />
          </div>
        </PropertyRow>

        <PropertyRow label={addDealTranslator(["labels", "contactName"])}>
          <div className="flex flex-col w-full">
            <ContactPopupSearch
              contacts={contacts}
              selectedContact={selectedContact}
              onChange={onContactChange}
              onSearch={onContactSearch}
              placeholder={addDealTranslator(["placeholders", "none"])}
              searchPlaceholder={addDealTranslator([
                "placeholders",
                "contactSearch"
              ])}
              noResultsText={addDealTranslator([
                "placeholders",
                "noResults"
              ])}
            />
          </div>
        </PropertyRow>
      </div>
    </div>
  );
};

export default DealPropertiesSidebar;
