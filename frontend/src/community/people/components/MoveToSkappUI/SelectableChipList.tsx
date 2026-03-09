import { RefObject } from "react";

export interface ChipItem<T = string> {
  label: string;
  value: T;
}

export interface SelectableChipListProps<T = string> {
  title?: string;
  items: ChipItem<T>[];
  selectedValues: T[];
  onChipClick: (value: T) => void;
  chipRefs?: RefObject<{ [key: string]: HTMLDivElement | null }>;
}

const SelectableChipList = <T = string,>({
  title,
  items,
  selectedValues,
  onChipClick,
  chipRefs
}: SelectableChipListProps<T>) => {
  const isSelected = (value: T) => selectedValues.includes(value);

  return (
    <div className="flex flex-col gap-2">
      <p className="subtitle3">{title}</p>
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
