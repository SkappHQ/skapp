import { Dispatch, JSX, KeyboardEvent, RefObject, SetStateAction } from "react";

export interface SelectableListOption<T = string> {
  label: string;
  value: T;
}

export interface SelectableListProps<T = string> {
  options: SelectableListOption<T>[];
  selected: T;
  setSelected: Dispatch<SetStateAction<T>>;
  firstColumnItems?: RefObject<{ [key: string]: HTMLDivElement | null }>;
  secondColumnItems?: RefObject<{ [key: string]: HTMLDivElement | null }>;
  onSelectionChange?: (value: T) => void;
  getSecondColumnFirstKey?: (value: T) => string;
}

const SelectableList = <T = string,>({
  options,
  selected,
  setSelected,
  firstColumnItems,
  secondColumnItems,
  onSelectionChange,
  getSecondColumnFirstKey
}: SelectableListProps<T>): JSX.Element => {
  const handleClick = (value: T) => {
    setSelected(value);
    onSelectionChange?.(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, value: T) => {
    // Handle Enter and Space key activation
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(value);
      onSelectionChange?.(value);

      // Focus management for second column if refs provided
      if (secondColumnItems?.current && getSecondColumnFirstKey) {
        requestAnimationFrame(() => {
          const firstChildKey = getSecondColumnFirstKey(value);
          if (secondColumnItems.current?.[firstChildKey]) {
            secondColumnItems.current[firstChildKey]?.focus();
          }
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 py-4 px-5">
      {options.map((option, index) => (
        <button
          ref={(el: HTMLButtonElement | null) => {
            if (firstColumnItems?.current) {
              firstColumnItems.current[index] = el as HTMLDivElement | null;
            }
          }}
          key={index}
          type="button"
          onClick={() => handleClick(option.value)}
          onKeyDown={(e) => handleKeyDown(e, option.value)}
          className={`w-full text-left justify-start px-4 py-2.5 subtitle1 rounded-lg transition-colors cursor-pointer focus:outline-1 focus:outline-black focus:outline-offset-2 hover:bg-tertiary-background ${
            selected === option.value
              ? "bg-primary-background text-primary-text"
              : "text-black"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SelectableList;
