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
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetMappedDealStages from "~community/crm/hooks/useGetMappedDealStages";
import {
  CrmContactLookup,
  CrmDealDetailResponseType,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { getStageColorClass } from "~community/crm/utils/crmUtil";

interface DealPropertiesSidebarProps {
  deal: CrmDealDetailResponseType;
  isOpen?: boolean;
}

const DealPropertiesSidebar: FC<DealPropertiesSidebarProps> = ({
  deal,
  isOpen
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const [amount, setAmount] = useState<string>(deal.amount ?? "");
  const [priority, setPriority] = useState<CrmPriorityEnum>(deal.priority);
  const [selectedStageId, setSelectedStageId] = useState<string>(
    String(deal.stageId)
  );
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner>(deal.owner);
  const [selectedContact, setSelectedContact] =
    useState<CrmContactLookup | null>(deal.contact);
  const [contactSearchTerm, setContactSearchTerm] = useState<string>("");

  const debouncedContactSearchTerm = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearchTerm,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isOpen && debouncedContactSearchTerm.length > 0
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
              className={`size-2 rounded-full shrink-0 ${getStageColorClass(stage.color)}`}
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
          onChange={(v) => setSelectedStageId(v)}
          variant="primary"
          className="rounded-lg"
          width="55%"
          placeholder={translateText(["placeholders", "stage"])}
          ariaLabel={translateText(["ariaLabels", "stage"])}
        />
      )}

      <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
        <PropertyField
          label={translateText(["value"])}
          value={amount}
          placeholder={translateText(["placeholders", "none"])}
          onChange={setAmount}
        />

        <PropertyRow label={translateText(["priority"])}>
          <PriorityDropdown value={priority} onChange={setPriority} />
        </PropertyRow>

        <PropertyRow label={translateText(["ownedBy"])}>
          <div className="flex flex-col w-full">
            <OwnerPopupSearch
              selectedUser={selectedOwner}
              onChange={setSelectedOwner}
              placeholder={translateText(["placeholders", "none"])}
              searchPlaceholder={translateText(["placeholders", "ownerSearch"])}
              noResultsText={translateText(["placeholders", "noResults"])}
            />
          </div>
        </PropertyRow>

        <PropertyRow label={translateText(["contact"])}>
          <div className="flex flex-col w-full">
            <ContactPopupSearch
              contacts={contacts}
              selectedContact={selectedContact}
              onChange={setSelectedContact}
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
      </div>
    </div>
  );
};

export default DealPropertiesSidebar;
