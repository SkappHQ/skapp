import { InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { useEffect, useMemo, useRef, useState } from "react";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";

interface CompanySearchFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (name: string, id: number | null) => void;
  options: { id: number; name: string }[];
  onAddCompany?: () => void;
  addCompanyLabel?: string;
  noResultsText?: string;
}

const CompanySearchField = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  onAddCompany,
  addCompanyLabel = "+ Add company",
  noResultsText = "No results found"
}: CompanySearchFieldProps) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredResults = useMemo(() => {
    return options.filter((o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: { id: number; name: string }) => {
    setSearchTerm(option.name);
    onChange(option.name, option.id);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <InputField
        label={label}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          const v = e.target.value;
          setSearchTerm(v);
          onChange(v, null);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        state="default"
        variant="md"
        rightIcon={<SearchIcon />}
        fullWidth
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
          {filteredResults.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">{noResultsText}</div>
          ) : (
            filteredResults.map((option) => (
              <div
                key={option.id}
                className="px-4 py-2.5 cursor-pointer text-black text-[15px] hover:bg-gray-100"
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </div>
            ))
          )}

          {onAddCompany && (
            <div
              className="px-4 py-3 cursor-pointer text-primary font-medium text-[15px] bg-primary/10 hover:bg-primary/15 flex items-center gap-1.5"
              onClick={() => {
                onAddCompany();
                setIsOpen(false);
              }}
            >
              <PlusIcon fill="currentColor" width="16" height="16" />
              {addCompanyLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySearchField;
