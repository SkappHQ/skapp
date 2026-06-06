import {
  DropdownWithSearchablePopup,
  DropdownValue
} from "@rootcodelabs/skapp-ui";
import type {
  DropdownOption,
  TriggerProps
} from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import { FC, useMemo } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

interface PriorityStyle {
  bg: string;
  text: string;
  arrow: string;
  label: string;
}

const PRIORITY_CONFIG: Record<CrmPriorityEnum, PriorityStyle> = {
  [CrmPriorityEnum.HIGH]: {
    bg: "#FFF1F2",
    text: "#9F1239",
    arrow: "↑",
    label: "High"
  },
  [CrmPriorityEnum.MEDIUM]: {
    bg: "#FFFBEB",
    text: "#92400E",
    arrow: "→",
    label: "Medium"
  },
  [CrmPriorityEnum.LOW]: {
    bg: "#F0FDF4",
    text: "#14532D",
    arrow: "↓",
    label: "Low"
  }
};

const PriorityDropdown: FC<Props> = ({ value, onChange, placeholder }) => {
  const options = useMemo<DropdownOption[]>(
    () =>
      Object.values(CrmPriorityEnum).map((p) => {
        const cfg = PRIORITY_CONFIG[p];
        return {
          id: p,
          value: p,
          label: (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-medium"
              style={{ backgroundColor: cfg.bg, color: cfg.text }}
            >
              {cfg.arrow} {cfg.label}
            </span>
          )
        };
      }),
    []
  );

  const selectedConfig = value ? PRIORITY_CONFIG[value as CrmPriorityEnum] : null;

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={
        selectedConfig
          ? { id: value, value, label: selectedConfig.label }
          : null
      }
      onChange={(v: DropdownValue | null) => {
        if (!v) return;
        const id =
          typeof v === "object" ? String(v.id) : String(v);
        onChange(id);
      }}
      placeholder={placeholder}
      searchable={false}
      clearable={false}
      width="100%"
      renderTrigger={(
        _val: DropdownValue | null,
        _isOpen: boolean,
        _disabled: boolean,
        triggerProps: TriggerProps
      ) => {
        const { ref, ...rest } = triggerProps;
        return (
          <button
            type="button"
            ref={ref as React.RefObject<HTMLButtonElement>}
            {...rest}
            className="flex items-center h-8"
          >
          {selectedConfig ? (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-medium"
              style={{
                backgroundColor: selectedConfig.bg,
                color: selectedConfig.text
              }}
            >
              {selectedConfig.arrow} {selectedConfig.label}
            </span>
          ) : (
            <span className="text-[14px] text-[#9CA3AF]">{placeholder}</span>
          )}
          </button>
        );
      }}
    />
  );
};

export default PriorityDropdown;
