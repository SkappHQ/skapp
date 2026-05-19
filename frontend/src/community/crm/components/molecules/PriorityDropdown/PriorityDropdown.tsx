import { Dropdown } from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { FC, useEffect, useMemo, useRef, useState } from "react";

import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { CrmPriorityType } from "~community/crm/types/CommonTypes";

interface Props {
  priorities: CrmPriorityType[];
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
}

const PriorityDropdown: FC<Props> = ({
  priorities,
  value,
  onChange,
  onSave,
  placeholder = "None"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && dropdownRef.current) {
      const timeout = setTimeout(() => {
        const trigger = dropdownRef.current?.querySelector(
          "button, [role=\"button\"], .dropdown-trigger"
        );
        if (trigger) {
          (trigger as HTMLElement).click();
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        isEditing
      ) {
        setIsEditing(false);
        if (onSave) {
          onSave(inputValue);
        }
        onChange(inputValue);
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, inputValue, onSave, onChange]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setInputValue(value);
    }
  };

  const handleDropdownChange = (selectedValue: string) => {
    setInputValue(selectedValue);
    setIsEditing(false);
    onChange(selectedValue);
    if (onSave) {
      onSave(selectedValue);
    }
  };

  const options = useMemo<DropdownOption[]>(
    () =>
      [...priorities]
        .sort((a, b) => b.orderIndex - a.orderIndex)
        .map((p) => ({
          id: String(p.id),
          value: String(p.id),
          label: <PriorityLabel priority={p.name} />
        })),
    [priorities]
  );

  const selectedPriority = priorities.find((p) => String(p.id) === inputValue);

  return (
    <div className="w-full">
      {isEditing ? (
        <div ref={inputRef} className="w-full">
          <div ref={dropdownRef}>
            <Dropdown
              options={options}
              value={inputValue}
              onChange={handleDropdownChange}
              variant="jsx-content"
              width="100%"
              placeholder={placeholder}
              padding="py-1 px-2"
              menuWidth="content"
            />
          </div>
        </div>
      ) : (
        <div
          className="w-full min-h-[32px] flex items-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
          onClick={handleClick}
        >
          <div className="flex items-center py-2 px-1 gap-2">
            {selectedPriority ? (
              <PriorityLabel priority={selectedPriority.name} />
            ) : (
              <span className="text-[14px] text-[#9CA3AF]">{placeholder}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityDropdown;
