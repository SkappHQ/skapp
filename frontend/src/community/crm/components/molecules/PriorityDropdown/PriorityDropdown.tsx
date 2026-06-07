import {
  Dropdown,
  HighPriorityIcon,
  Label,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

import PriorityLabel from "../../atoms/PriorityLabel/PriorityLabel";

interface Props {
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
}

interface PriorityStyle {
  bg: string;
  text: string;
  icon: ReactNode;
  label: string;
}

const PRIORITY_CONFIG: Record<CrmPriorityEnum, PriorityStyle> = {
  [CrmPriorityEnum.HIGH]: {
    bg: "bg-semantic-red-background",
    text: "text-semantic-red-text",
    icon: <HighPriorityIcon size={12} />,
    label: "High"
  },
  [CrmPriorityEnum.MEDIUM]: {
    bg: "bg-semantic-amber-background",
    text: "text-semantic-amber-text",
    icon: <MediumPriorityIcon size={12} />,
    label: "Medium"
  },
  [CrmPriorityEnum.LOW]: {
    bg: "bg-semantic-green-background",
    text: "text-semantic-green-text",
    icon: <LowPriorityIcon size={12} />,
    label: "Low"
  }
};

const PRIORITY_ORDER: CrmPriorityEnum[] = [
  CrmPriorityEnum.HIGH,
  CrmPriorityEnum.MEDIUM,
  CrmPriorityEnum.LOW
];

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

  const priorityOptions = useMemo<DropdownOption[]>(
    () =>
      PRIORITY_ORDER.map((p) => {
        const cfg = PRIORITY_CONFIG[p];
        return {
          id: p,
          value: p,
          label: (
            <Label
              backgroundColor={cfg.bg}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium"
            >
              {cfg.icon}
              <span>{cfg.label}</span>
            </Label>
          )
        };
      }),
    []
  );

  const handleChange = (val: string) => {
    setLocalValue(val);
    setIsEditing(false);
    onChange?.(val);
    onSave?.(val);
  };

  return (
    <div className="flex items-center min-h-8 w-full">
      {label && (
        <span className="shrink-0 w-28 text-[13px] text-gray-500">{label}</span>
      )}
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
