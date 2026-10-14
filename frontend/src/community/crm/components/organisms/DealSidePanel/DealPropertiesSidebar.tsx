import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompaniesByIds } from "~community/crm/api/CompanyApi";
import { useGetContactLookup } from "~community/crm/api/ContactApi";
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
import { useStageNameMapper } from "~community/crm/hooks/useStageNameMapper";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEntity,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
import { getOrderedStages } from "~community/crm/utils/commonUtil";
import {
  getMissingCompanyIds,
  updateCompanyRecord
} from "~community/crm/utils/companyUtil";
import {
  getContactDisplayName,
  toContactCompanyIds
} from "~community/crm/utils/contactUtil";
import { validateDealAmount } from "~community/crm/utils/dealValidations";

interface DealPropertiesSidebarProps {
  dealId: number;
  onStageChange: (stageId: number) => void;
  onAmountChange: (amount: string) => void;
  onPriorityChange: (priority: CrmPriorityEnum) => void;
  onOwnerChange: (owner: CrmOwnerEntity) => void;
  onContactChange: (contact: CrmContactEntity) => void;
}

const DealPropertiesSidebar: FC<DealPropertiesSidebarProps> = ({
  dealId,
  onStageChange,
  onAmountChange,
  onPriorityChange,
  onOwnerChange,
  onContactChange
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");
  const { getStageByName } = useStageNameMapper();

  const { deal, stagesRecord, contactRecord, companies, setCompanies, owners } =
    useCrmStore(
      useShallow((state) => ({
        deal: dealId != null ? state.deals[dealId] : undefined,
        stagesRecord: state.stages,
        contactRecord: state.contacts,
        companies: state.companies,
        setCompanies: state.setCompanies,
        owners: state.owners
      }))
    );

  const stages = useMemo(() => getOrderedStages(stagesRecord), [stagesRecord]);

  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const debouncedContactSearchTerm = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: contactLookupData } = useGetContactLookup(
    {
      searchKeyword: debouncedContactSearchTerm,
      size: DEFAULT_LOOKUP_PAGE_SIZE
    },
    debouncedContactSearchTerm.length > 0
  );
  const contacts = useMemo(
    () => contactLookupData?.items ?? [],
    [contactLookupData?.items]
  );

  const missingCompanyIds = useMemo(() => {
    const companyIds = toContactCompanyIds(contacts);

    if (deal?.companyId != null) {
      companyIds.push(deal.companyId);
    }

    return getMissingCompanyIds(companyIds, companies);
  }, [deal, contacts, companies]);
  const { data: fetchedCompanies } = useGetCompaniesByIds(
    missingCompanyIds,
    missingCompanyIds.length > 0
  );
  useEffect(() => {
    if (fetchedCompanies && fetchedCompanies.length > 0) {
      setCompanies(updateCompanyRecord(companies, fetchedCompanies));
    }
  }, [fetchedCompanies]);

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
    deal.ownerId != null ? (owners[deal.ownerId] ?? null) : null;
  const selectedContact: CrmContactEntity | null =
    deal.contactId != null
      ? {
          id: deal.contactId,
          name: getContactDisplayName(contactRecord[deal.contactId]),
          companyId: deal.companyId
        }
      : null;

  const handleStageChange = (value: string): void => {
    if (value !== selectedStageId) onStageChange(Number(value));
  };

  const handleContactChange = (contact: CrmContactEntity | null): void => {
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
        placeholder={translateText([
          "deals",
          "common",
          "placeholders",
          "stage"
        ])}
        ariaLabel={translateAria(["deals", "common", "stage"])}
      />

      <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
        <PropertyRow
          label={translateText(["deals", "common", "labels", "contact"])}
          required
        >
          <div className="flex flex-col w-full">
            <ContactPopupSearch
              contacts={contacts}
              companies={companies}
              selectedContact={selectedContact}
              onChange={handleContactChange}
              onSearch={setContactSearchTerm}
              ariaRequired
              placeholder={translateText([
                "deals",
                "common",
                "placeholders",
                "none"
              ])}
              searchPlaceholder={translateText([
                "deals",
                "common",
                "placeholders",
                "contactSearch"
              ])}
              noResultsText={translateText([
                "deals",
                "common",
                "placeholders",
                "noResults"
              ])}
            />
          </div>
        </PropertyRow>

        <PropertyField
          label={translateText(["deals", "common", "labels", "value"])}
          value={deal.amount ?? ""}
          placeholder={translateText([
            "deals",
            "common",
            "placeholders",
            "none"
          ])}
          ariaLabel={translateAria(["deals", "common", "amount"])}
          validate={(value) => validateDealAmount(value, translateText)}
          onSave={onAmountChange}
        />

        <PropertyRow
          label={translateText(["deals", "common", "labels", "priority"])}
        >
          <PriorityDropdown
            value={deal.priority ?? CrmPriorityEnum.MEDIUM}
            onChange={handlePriorityChange}
          />
        </PropertyRow>

        <PropertyRow
          label={translateText(["deals", "common", "labels", "ownedBy"])}
        >
          <div className="flex flex-col w-full">
            <OwnerPopupSearch
              selectedUser={selectedOwner}
              onChange={handleOwnerChange}
              placeholder={translateText([
                "deals",
                "common",
                "placeholders",
                "none"
              ])}
              searchPlaceholder={translateText([
                "deals",
                "common",
                "placeholders",
                "ownerSearch"
              ])}
              noResultsText={translateText([
                "deals",
                "common",
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
