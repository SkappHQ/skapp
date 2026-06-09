import { CloseIcon, InputField, Popper } from "@rootcodelabs/skapp-ui";
import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

interface ChipAutocompleteProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (items: string[]) => void;
  options?: string[];
  isDisabled?: boolean;
  readOnly?: boolean;
  maxResults?: number;
}

const ChipAutocomplete: FC<ChipAutocompleteProps> = ({
  id = "chip-autocomplete",
  label,
  placeholder,
  value = [],
  onChange,
  options = [],
  isDisabled = false,
  readOnly = false,
  maxResults = 5
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options
    .filter(
      (option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(option)
    )
    .slice(0, maxResults);

  useEffect(() => {
    setActiveIndex(null);
  }, [inputValue]);

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
    } else if (inputValue.trim()) {
      const trimmed = inputValue.trim();
      if (!value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setInputValue("");
      handleClose();
    }
  }, [
    activeIndex,
    filteredOptions,
    inputValue,
    value,
    onChange,
    handleSelect,
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
    <div className="w-full relative" ref={inputWrapperRef}>
      <InputField
        id={`${id}-input`}
        className="w-full"
        fullWidth
        label={label}
        placeholder={value.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        disabled={isDisabled}
        readOnly={readOnly}
        leftIcon={
          value.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 items-center">
              {value.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1 rounded-full bg-tertiary-background py-0.5 px-2.5 text-sm text-secondary-text max-w-50 border border-secondary-accent"
                >
                  <span className="truncate">{item}</span>
                  {!readOnly && !isDisabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      className="flex items-center justify-center shrink-0 cursor-pointer"
                      aria-label={`Remove ${item}`}
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : undefined
        }
      />

      {isOpen && filteredOptions.length > 0 && (
        <Popper
          id={`${id}-popper`}
          anchorEl={inputWrapperRef.current}
          anchorElWidth={inputWrapperRef.current?.offsetWidth}
          open={isOpen}
          position="bottom"
          handleClose={handleClose}
          ariaRole="presentation"
          ariaLabel={label || placeholder}
          isFlip
          disableAutoFocus
          positionStrategy="absolute"
          containerClassName="rounded-md border border-secondary-accent bg-white shadow-lg"
        >
          <ul
            className="max-h-50 overflow-y-auto"
            role="listbox"
            id={`${id}-list`}
            aria-label={label || placeholder}
          >
            {filteredOptions.map((option, index) => (
              <li
                key={option}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-2 cursor-pointer outline-none transition-all duration-150 truncate ${
                  index === activeIndex
                    ? "bg-tertiary-background rounded"
                    : "hover:bg-tertiary-background"
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
        </Popper>
      )}
    </div>
  );
};

export default ChipAutocomplete;
