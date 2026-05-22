import { DropdownWithSearchablePopup } from "@rootcodelabs/skapp-ui";
import type {
  DropdownOption,
  DropdownValue,
  TriggerProps
} from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import React, { FC, useMemo, useState } from "react";

import { CrmCompanyType } from "~community/crm/types/CommonTypes";

interface Props {
  companies: CrmCompanyType[];
  selectedCompany: CrmCompanyType | null;
  onChange: (company: CrmCompanyType | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

const CompanyPopupSearch: FC<Props> = ({
  companies,
  selectedCompany,
  onChange,
  placeholder,
  searchPlaceholder
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const options = useMemo<DropdownOption[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = term
      ? companies.filter((c) => c.name.toLowerCase().includes(term))
      : companies;
    return list.map((c) => ({
      id: String(c.id),
      value: String(c.id),
      label: c.name
    }));
  }, [companies, searchTerm]);

  const selectedOption = useMemo<DropdownOption | null>(
    () =>
      selectedCompany
        ? {
            id: String(selectedCompany.id),
            value: String(selectedCompany.id),
            label: selectedCompany.name
          }
        : null,
    [selectedCompany]
  );

  const handleChange = (v: DropdownValue | null) => {
    if (!v) {
      onChange(null);
      return;
    }
    const id =
      typeof v === "object" ? String((v as DropdownOption).id) : String(v);
    onChange(companies.find((c) => String(c.id) === id) ?? null);
  };

  const renderTrigger = (
    _value: DropdownValue | null,
    _isOpen: boolean,
    _disabled: boolean,
    triggerProps: TriggerProps
  ) => {
    const { ref, onKeyDown, ...rest } = triggerProps;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="button"
        tabIndex={0}
        onKeyDown={
          onKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement>
        }
        className={`text-[14px] cursor-pointer hover:bg-gray-50 rounded-lg w-full pl-1 ${
          selectedCompany ? "text-[#111827]" : "text-[#9CA3AF]"
        }`}
        {...rest}
      >
        {selectedCompany ? selectedCompany.name : placeholder}
      </div>
    );
  };

  const renderOption = (
    option: DropdownValue,
    _index: number,
    onSelect: (o: DropdownValue) => void
  ) => {
    const id =
      typeof option === "object"
        ? String((option as DropdownOption).id)
        : String(option);
    const label =
      typeof option === "object"
        ? String((option as DropdownOption).label)
        : String(option);

    return (
      <div
        key={id}
        role="option"
        tabIndex={0}
        aria-selected={
          selectedCompany ? String(selectedCompany.id) === id : false
        }
        className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-[14px] text-[#111827]"
        onClick={() => onSelect(option)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(option);
        }}
      >
        {label}
      </div>
    );
  };

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={selectedOption}
      onChange={handleChange}
      onSearch={setSearchTerm}
      searchable
      clearable
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      width="w-full"
      popupWidth="w-56"
      renderTrigger={renderTrigger}
      renderOption={renderOption}
    />
  );
};

export default CompanyPopupSearch;
