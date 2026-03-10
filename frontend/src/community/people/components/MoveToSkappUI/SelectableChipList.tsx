import { Checkbox } from "@rootcodelabs/skapp-ui";
import { RefObject } from "react";

export interface ChipItem<T> {
  label: string;
  value: T;
}

export interface SelectableChipListProps<T> {
  title?: string;
  items: ChipItem<T>[];
  selectedValues: T[];
  onChipClick: (value: T) => void;
  chipRefs?: RefObject<{ [key: string]: HTMLDivElement | null }>;
}

const SelectableChipList = <T,>({
  title,
  items,
  selectedValues,
  onChipClick,
  chipRefs
}: SelectableChipListProps<T>) => {
  const isSelected = (value: T) => selectedValues.includes(value);
  const showAsCheckboxList = items.length > 5;

  if (showAsCheckboxList) {
    return (
      <div className="flex flex-col gap-2">
        {title && <p className="subtitle3">{title}</p>}
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {items.map(({ label, value }, index) => {
            const selected = isSelected(value);
            return (
              <div
                key={String(value)}
                ref={(el) => {
                  if (chipRefs?.current && title) {
                    chipRefs.current[`${title}${index}`] = el;
                  }
                }}
                className="flex flex-row gap-2 items-center"
              >
                <Checkbox
                  checked={selected}
                  onChange={() => onChipClick(value)}
                />
                <p className="body2">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {title && <p className="subtitle3">{title}</p>}
      <div className="flex flex-wrap flex-row gap-2 space-x-1">
        {items.map(({ label, value }, index) => {
          const selected = isSelected(value);
          return (
            <div
              key={String(value)}
              ref={(el) => {
                if (chipRefs?.current && title) {
                  chipRefs.current[`${title}${index}`] = el;
                }
              }}
              role="button"
              tabIndex={0}
              onClick={() => onChipClick(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChipClick(value);
                }
              }}
              className={`flex items-center px-3 h-8 rounded-full cursor-pointer transition-colors border ${selected ? "bg-primary-background text-primary-text border-primary-accent" : "bg-tertiary-background border-transparent"}`}
            >
              <span className="body3 whitespace-nowrap">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectableChipList;
