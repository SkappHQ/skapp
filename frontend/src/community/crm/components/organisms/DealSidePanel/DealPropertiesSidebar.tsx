import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";

import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCrmContacts } from "~community/crm/api/ContactApi";
import { useGetDealStages } from "~community/crm/api/crmDealApi";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import {
  CrmContactLookup,
  CrmDealDetailResponseType,
  CrmOwner
} from "~community/crm/types/CommonTypes";

interface DealPropertiesSidebarProps {
  deal: CrmDealDetailResponseType;
  isOpen: boolean;
}

const DealPropertiesSidebar: FC<DealPropertiesSidebarProps> = ({
  deal,
  isOpen
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const [amount, setAmount] = useState(deal.amount ?? "");
  const [priority, setPriority] = useState<CrmPriorityEnum>(deal.priority);
  const [selectedStageId, setSelectedStageId] = useState(String(deal.stageId));
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(
    deal.owner
  );
  const [selectedContact, setSelectedContact] =
    useState<CrmContactLookup | null>(deal.contact);
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isOpen
  );
  const contacts = contactLookupData?.items ?? [];

  const { data: stages = [], isLoading: isStagesLoading } =
    useGetDealStages(isOpen);

  const stageOptions = useMemo(
    () =>
      stages.map((s) => ({
        id: String(s.id),
        value: String(s.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [stages]
  );

  useEffect(() => {
    setAmount(deal.amount ?? "");
    setPriority(deal.priority);
    setSelectedStageId(String(deal.stageId));
    setSelectedOwner(deal.owner);
    setSelectedContact(deal.contact);
  }, [deal]);

  return (
    <div className="w-1/3 flex flex-col gap-4 shrink-0">
      {isStagesLoading ? (
        <MultipleSkeletons numOfSkeletons={1} height={38} />
      ) : (
        <Dropdown
          options={stageOptions}
          value={selectedStageId}
          onChange={(v) => setSelectedStageId(String(v))}
          variant="primary"
          className="rounded-lg"
          width="55%"
          placeholder={translateText(["placeholders", "stage"])}
          ariaLabel={translateText(["ariaLabels", "stage"])}
        />
      )}

      <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
        <PropertyRow label={translateText(["value"])}>
          <div className="flex flex-col w-full px-1">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={translateText(["placeholders", "none"])}
              type="text"
              className="w-full bg-transparent outline-none body2 placeholder:text-secondary-text"
              aria-label={translateText(["ariaLabels", "amount"])}
            />
          </div>
        </PropertyRow>

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
