import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useRef, useState } from "react";

import useGetPriorityOptions from "~community/crm/hooks/useGetPriorityOptions";

import PriorityLabel from "../../atoms/PriorityLabel/PriorityLabel";

interface Props {
  label: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
}

const PriorityDropdown: FC<Props> = ({
  label,
  value,
  placeholder = "None",
  onChange,
  onSave
}) => {
  const [localValue, setLocalValue] = useState(value ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const priorityOptions = useGetPriorityOptions();

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => {
      const trigger = containerRef.current?.querySelector<HTMLElement>(
        "button, [role='button'], .dropdown-trigger"
      );
      trigger?.click();
    }, 100);
    return () => clearTimeout(timer);
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsEditing(false);
        const save = onSave ?? onChange;
        if (localValue) save?.(localValue);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, localValue, onChange, onSave]);

  const handleChange = (val: string) => {
    setLocalValue(val);
    setIsEditing(false);
    onChange?.(val);
    onSave?.(val);
  };

  return (
    <div className="flex items-center min-h-8">
      <span className="shrink-0 w-28 text-[13px] text-gray-500">{label}</span>
      <div className="flex-1" ref={containerRef}>
        {isEditing ? (
          <Dropdown
            options={priorityOptions}
            value={localValue}
            onChange={handleChange}
            variant="jsx-content"
            width="100%"
            placeholder={placeholder}
            hideArrowIcon
          />
        ) : (
          <button
            type="button"
            className="flex items-center min-h-8 px-2 rounded hover:bg-gray-50 cursor-pointer w-full text-left"
            onClick={() => setIsEditing(true)}
          >
            {localValue ? (
              priorityOptions.find((o) => o.value === localValue)?.label
            ) : (
              <span className="text-[13px] text-gray-400">{placeholder}</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PriorityDropdown;
