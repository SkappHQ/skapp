import {
  Dropdown,
  HighPriorityIcon,
  Label,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { FC, useEffect, useMemo, useRef, useState } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

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

  const priorityOptions = useMemo<DropdownOption[]>(
    () => [
      {
        id: "high",
        value: CrmPriorityEnum.HIGH,
        label: (
          <Label
            backgroundColor="bg-semantic-red-background"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium"
          >
            <HighPriorityIcon size={12} />
            <span>High</span>
          </Label>
        )
      },
      {
        id: "medium",
        value: CrmPriorityEnum.MEDIUM,
        label: (
          <Label
            backgroundColor="bg-semantic-amber-background"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium"
          >
            <MediumPriorityIcon size={12} />
            <span>Medium</span>
          </Label>
        )
      },
      {
        id: "low",
        value: CrmPriorityEnum.LOW,
        label: (
          <Label
            backgroundColor="bg-semantic-green-background"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium"
          >
            <LowPriorityIcon size={12} />
            <span>Low</span>
          </Label>
        )
      }
    ],
    []
  );

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
              <PriorityLabel priority={localValue} />
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
