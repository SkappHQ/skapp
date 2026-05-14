import {
  AvatarChip,
  CloseIcon,
  InputField,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { useEffect, useMemo, useRef, useState } from "react";

import { ContactOwner } from "~community/crm/types/CommonTypes";

interface OwnerSearchFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  selectedOwner: ContactOwner | null;
  onSelect: (owner: ContactOwner) => void;
  onClear: () => void;
  options: ContactOwner[];
  noResultsText?: string;
}

const getFullName = (owner: ContactOwner) =>
  [owner.firstName, owner.lastName].filter(Boolean).join(" ");

const OwnerSearchField = ({
  label,
  placeholder,
  selectedOwner,
  onSelect,
  onClear,
  options,
  noResultsText = "No results found"
}: OwnerSearchFieldProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredResults = useMemo(() => {
    return options.filter((o) =>
      getFullName(o).toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSelect = (owner: ContactOwner) => {
    onSelect(owner);
    setSearchTerm("");
    setIsOpen(false);
  };

  // When an owner is selected, show the selected chip instead of the search field
  if (selectedOwner) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-black font-medium text-sm mb-1">{label}</label>
        )}
        <div className="h-12 rounded-lg bg-gray-100 flex items-center px-3">
          <AvatarChip
            label={getFullName(selectedOwner)}
            avatarProps={{
              src: selectedOwner.authPic ?? undefined,
              firstName: selectedOwner.firstName,
              lastName: selectedOwner.lastName ?? "",
              size: "sm"
            }}
            showActionButton
            onActionClick={onClear}
            actionIcon={<CloseIcon />}
            actionButtonAriaLabel="Remove owner"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <InputField
        label={label}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
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
            filteredResults.map((owner) => (
              <div
                key={owner.employeeId}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                onClick={() => handleSelect(owner)}
              >
                <AvatarChip
                  label={getFullName(owner)}
                  avatarProps={{
                    src: owner.authPic ?? undefined,
                    firstName: owner.firstName,
                    lastName: owner.lastName ?? "",
                    size: "sm"
                  }}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerSearchField;
