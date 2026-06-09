import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { FC, KeyboardEvent, useState } from "react";

import CompanyPopupSearch from "~community/crm/components/molecules/CompanyPopupSearch/CompanyPopupSearch";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import PeoplePopupSearch from "~community/crm/components/molecules/PeoplePopupSearch/PeoplePopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import {
  CrmCompanyType,
  CrmContactType,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

import PropertyRow from "./PropertyRow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealPropertiesProps {
  stageOptions: DropdownOption[];
  stageValue: string;
  onStageChange: (value: string) => void;
  amountValue: string;
  onAmountChange: (value: string) => void;
  priorityValue: string;
  onPriorityChange: (value: string) => void;
  selectedOwner: CrmOwner | null;
  onOwnerChange: (user: CrmOwner | null) => void;
  owners: CrmOwner[];
  onOwnerSearch?: (term: string) => void;
  selectedContact: CrmContactType | null;
  onContactChange: (contact: CrmContactType | null) => void;
  contacts: CrmContactType[];
  selectedCompany: CrmCompanyType | null;
  onCompanyChange: (company: CrmCompanyType | null) => void;
  companies: CrmCompanyType[];
}

// ---------------------------------------------------------------------------
// DealProperties
// ---------------------------------------------------------------------------

const DealProperties: FC<DealPropertiesProps> = ({
  stageOptions,
  stageValue,
  onStageChange,
  amountValue,
  onAmountChange,
  priorityValue,
  onPriorityChange,
  selectedOwner,
  onOwnerChange,
  owners,
  onOwnerSearch,
  selectedContact,
  onContactChange,
  contacts,
  selectedCompany,
  onCompanyChange,
  companies
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      {/* Stage dropdown */}
      <Dropdown
        options={stageOptions}
        value={stageValue}
        onChange={(v) => onStageChange(v)}
        variant="jsx-content"
        className="rounded-lg"
        width="55%"
        placeholder="Stage"
      />

      {/* Property card */}
      <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-1 w-full">
        {/* Value — click to edit */}
        <PropertyRow label="Value">
          {editingField === "amount" ? (
            <div
              className="flex-1 min-w-0"
              onBlur={(e) => {
                if (
                  !e.currentTarget.contains(e.relatedTarget as Node | null)
                )
                  setEditingField(null);
              }}
            >
              <InputField
                name="amount"
                value={amountValue}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="Enter amount"
                type="number"
                min="0"
                step="0.01"
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                variant="sm"
                fullWidth
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              className={`body2 text-left w-full ${
                amountValue ? "text-black" : "text-tertiary-text"
              }`}
              onClick={() => setEditingField("amount")}
            >
              {amountValue ? formatValue(amountValue) : "None"}
            </button>
          )}
        </PropertyRow>

        {/* Priority */}
        <PropertyRow label="Priority">
          <PriorityDropdown
            value={priorityValue}
            onChange={(v) => onPriorityChange(v)}
            placeholder="None"
          />
        </PropertyRow>

        {/* Owned by */}
        <PropertyRow label="Owned by">
          <PeoplePopupSearch
            users={owners}
            selectedUser={selectedOwner}
            onSearch={onOwnerSearch}
            onChange={(user) => onOwnerChange(user)}
            placeholder="None"
            searchPlaceholder="Search people"
          />
        </PropertyRow>

        {/* Contact name */}
        <PropertyRow label="Contact name">
          <ContactPopupSearch
            contacts={contacts}
            selectedContact={selectedContact}
            onChange={(c) => onContactChange(c)}
            placeholder="None"
            searchPlaceholder="Search contacts"
          />
        </PropertyRow>

        {/* Company name */}
        <PropertyRow label="Company name">
          <CompanyPopupSearch
            companies={companies}
            selectedCompany={selectedCompany}
            onChange={(co) => onCompanyChange(co)}
            placeholder="None"
            searchPlaceholder="Search companies"
          />
        </PropertyRow>
      </div>
    </div>
  );
};

export default DealProperties;
