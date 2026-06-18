import { Chip, Popper } from "@rootcodelabs/skapp-ui";
import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

interface ChipAutocompleteProps {
  id?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  value: string[];
  onChange: (items: string[]) => void;
  options?: string[];
  isDisabled?: boolean;
  readOnly?: boolean;
  endIcon?: ReactElement;
}

const ChipAutocomplete: FC<ChipAutocompleteProps> = ({
  id = "chip-autocomplete",
  label,
  placeholder,
  helperText,
  value = [],
  onChange,
  options = [],
  isDisabled = false,
  readOnly = false,
  endIcon
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [anchorWidth, setAnchorWidth] = useState(0);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(
    () =>
      options.filter(
        (option) =>
          option.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(option)
      ),
    [options, inputValue, value]
  );

  useEffect(() => {
    setActiveIndex(null);
  }, [inputValue]);

  useEffect(() => {
    const node = inputBoxRef.current;
    if (!node) return;

    const updateWidth = () =>
      setAnchorWidth(node.getBoundingClientRect().width);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(null);
  }, []);

  const handleDelete = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  const handleSelect = useCallback(
    (option: string) => {
      if (!value.includes(option)) {
        onChange([...value, option]);
      }
      setInputValue("");
      handleClose();
    },
    [value, onChange, handleClose]
  );

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  }, []);

  const handleArrowDown = useCallback(() => {
    if (!isOpen && filteredOptions.length > 0) {
      setIsOpen(true);
      setActiveIndex(0);
    } else if (filteredOptions.length > 0) {
      setActiveIndex((prev) =>
        prev === null || prev >= filteredOptions.length - 1 ? 0 : prev + 1
      );
    }
  }, [isOpen, filteredOptions.length]);

  const handleArrowUp = useCallback(() => {
    if (filteredOptions.length > 0) {
      setActiveIndex((prev) =>
        prev === null || prev <= 0 ? filteredOptions.length - 1 : prev - 1
      );
    }
  }, [filteredOptions.length]);

  const handleEnter = useCallback(() => {
    if (activeIndex !== null && filteredOptions[activeIndex]) {
      handleSelect(filteredOptions[activeIndex]);
    } else if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
      handleClose();
    }
  }, [
    activeIndex,
    filteredOptions,
    handleSelect,
    inputValue,
    value,
    onChange,
    handleClose
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          handleArrowDown();
          break;
        case "ArrowUp":
          e.preventDefault();
          handleArrowUp();
          break;
        case "Enter":
          e.preventDefault();
          handleEnter();
          break;
        case "Escape":
          handleClose();
          break;
        case "Backspace":
          if (!inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
          }
          break;
      }
    },
    [
      handleArrowDown,
      handleArrowUp,
      handleEnter,
      handleClose,
      inputValue,
      value,
      onChange
    ]
  );

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        {label && <label className="subtitle1">{label}</label>}
        <div
          ref={inputBoxRef}
          className={`flex items-center gap-2 min-h-12 w-full rounded-lg bg-tertiary-background px-3 py-1 ${
            isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-text"
          }`}
          onClick={() => {
            if (!isDisabled && !readOnly) {
              inputRef.current?.focus();
            }
          }}
        >
          <div className="flex flex-wrap gap-1 items-center flex-1">
            {value.map((item) => (
              <Chip
                key={item}
                label={item}
                size="sm"
                isSelected
                disabled={isDisabled}
                onDelete={
                  !readOnly && !isDisabled
                    ? () => handleDelete(item)
                    : undefined
                }
                className="bg-white border border-none text-secondary-text"
              />
            ))}
            {!readOnly && (
              <input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                placeholder={value.length === 0 ? placeholder : ""}
                className="outline-none body1"
                role="combobox"
                aria-expanded={isOpen && filteredOptions.length > 0}
                aria-controls={`${id}-list`}
                aria-activedescendant={
                  activeIndex !== null
                    ? `${id}-option-${activeIndex}`
                    : undefined
                }
                aria-autocomplete="list"
              />
            )}
          </div>
          {endIcon}
        </div>
      </div>

      <Popper
        id={`${id}-popper`}
        anchorEl={inputBoxRef.current}
        anchorElWidth={anchorWidth}
        open={
          isOpen &&
          ((helperText && inputValue === "") || filteredOptions.length > 0)
        }
        position="bottom-start"
        handleClose={handleClose}
        ariaRole="presentation"
        isFlip
        disableAutoFocus
        containerClassName="rounded-md border border-secondary-accent bg-white shadow-lg"
      >
        <ul
          className="max-h-50 overflow-y-auto"
          role="listbox"
          id={`${id}-list`}
          aria-label={label || placeholder}
        >
          {helperText && inputValue === "" ? (
            <li className="px-4 py-2 body2 text-secondary-text select-none cursor-default">
              {helperText}
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(option);
                  }
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-2 cursor-pointer outline-none transition-all duration-150 truncate ${
                  index === activeIndex
                    ? "bg-tertiary-background rounded"
                    : "hover:bg-tertiary-background"
                }`}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      </Popper>
    </div>
  );
};

export default ChipAutocomplete;
