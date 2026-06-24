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

interface StageData {
  isLoading: boolean;
  options: DropdownOption[];
  selectedId: string;
  onChange: (value: string) => void;
}

interface PropertyData {
  amount: string;
  priority: CrmPriorityEnum;
  owner: CrmOwner | null;
  contact: CrmContactLookup | null;
}

interface PropertyHandlers {
  onAmountChange: (value: string) => void;
  onPriorityChange: (value: CrmPriorityEnum) => void;
  onOwnerChange: (owner: CrmOwner | null) => void;
  onContactChange: (contact: CrmContactLookup | null) => void;
  onContactSearch: (term: string) => void;
}

interface DealPropertiesSidebarProps {
  stage: StageData;
  properties: PropertyData;
  handlers: PropertyHandlers;
  contacts: CrmContactLookup[];
}

const DealPropertiesSidebar: FC<DealPropertiesSidebarProps> = ({
  stage,
  properties,
  handlers,
  contacts
}) => {
  const sidePanelTranslator = useTranslator(
    "crmModule",
    "deals",
    "sidePanel"
  );

  return (
    <div className="w-1/3 flex flex-col gap-4 shrink-0">
      {stage.isLoading ? (
        <MultipleSkeletons numOfSkeletons={1} height={38} />
      ) : (
        <Dropdown
          options={stage.options}
          value={stage.selectedId}
          onChange={(v) => stage.onChange(String(v))}
          variant="primary"
          className="rounded-lg"
          width="55%"
          placeholder={sidePanelTranslator(["placeholders", "stage"])}
          ariaLabel={sidePanelTranslator(["ariaLabels", "stage"])}
        />
      )}

      <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
        <PropertyRow label={sidePanelTranslator(["value"])}>
          <div className="flex flex-col w-full px-1">
            <input
              value={properties.amount}
              onChange={(e) => handlers.onAmountChange(e.target.value)}
              placeholder={sidePanelTranslator(["placeholders", "none"])}
              type="text"
              className="w-full bg-transparent outline-none body2 placeholder:text-secondary-text"
              aria-label={sidePanelTranslator(["ariaLabels", "amount"])}
            />
          </div>
        </PropertyRow>

        <PropertyRow label={sidePanelTranslator(["priority"])}>
          <PriorityDropdown value={properties.priority} onChange={handlers.onPriorityChange} />
        </PropertyRow>

        <PropertyRow label={sidePanelTranslator(["ownedBy"])}>
          <div className="flex flex-col w-full">
            <OwnerPopupSearch
              selectedUser={properties.owner}
              onChange={handlers.onOwnerChange}
              placeholder={sidePanelTranslator(["placeholders", "none"])}
              searchPlaceholder={sidePanelTranslator([
                "placeholders",
                "ownerSearch"
              ])}
              noResultsText={sidePanelTranslator([
                "placeholders",
                "noResults"
              ])}
            />
          </div>
        </PropertyRow>

        <PropertyRow label={sidePanelTranslator(["contact"])}>
          <div className="flex flex-col w-full">
            <ContactPopupSearch
              contacts={contacts}
              selectedContact={properties.contact}
              onChange={handlers.onContactChange}
              onSearch={handlers.onContactSearch}
              placeholder={sidePanelTranslator(["placeholders", "none"])}
              searchPlaceholder={sidePanelTranslator([
                "placeholders",
                "contactSearch"
              ])}
              noResultsText={sidePanelTranslator([
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
