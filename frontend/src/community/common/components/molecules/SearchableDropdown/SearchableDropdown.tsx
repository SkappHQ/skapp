import { InputField, Popper, SearchIcon } from "@rootcodelabs/skapp-ui";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from "react";

export interface SearchableDropdownItem {
  id: string;
  content: React.ReactNode;
}

export interface SearchableDropdownProps {
  id: string;
  items: SearchableDropdownItem[];
  onSelect: (item: SearchableDropdownItem) => void;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  required?: boolean;
  emptyMessage?: React.ReactNode;
  state?: "default" | "error";
  variant?: "sm" | "md" | "lg";
  positionStrategy?: "absolute" | "fixed";
  onClose?: () => void;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  id,
  items,
  onSelect,
  value,
  onChange,
  placeholder,
  label,
  name,
  required = false,
  emptyMessage,
  state = "default",
  variant = "sm",
  positionStrategy = "absolute",
  onClose
}) => {
  const uid = useId();
  const baseId = `${id}-${uid}`;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const popperContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(items.length > 0 ? 0 : -1);
    }
  }, [items.length, activeIndex]);

  const isDropdownOpen = isOpen && (items.length > 0 || !!emptyMessage);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    onClose?.();
  }, [onClose]);

  const handleSelect = useCallback(
    (item: SearchableDropdownItem) => {
      onSelect(item);
      handleClose();
    },
    [onSelect, handleClose]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e);
      setActiveIndex(-1);
      if (e.target.value.trim().length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    },
    [onChange]
  );

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen && e.key === "ArrowDown" && items.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
        return;
      }

      if (!isDropdownOpen) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextDown =
            activeIndex < items.length - 1 ? activeIndex + 1 : activeIndex;
          setActiveIndex(nextDown);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const nextUp = activeIndex > 0 ? activeIndex - 1 : 0;
          setActiveIndex(nextUp);
          break;
        }
        case "Tab":
          handleClose();
          break;
        case "Enter":
          if (activeIndex >= 0 && activeIndex < items.length) {
            e.preventDefault();
            handleSelect(items[activeIndex]);
          } else if (items.length === 0 && popperContentRef.current) {
            const btn = popperContentRef.current.querySelector("button");
            if (btn) {
              e.preventDefault();
              btn.click();
              handleClose();
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
      }
    },
    [isDropdownOpen, items, activeIndex, handleSelect, handleClose]
  );

  return (
    <div
      className="w-full relative input-plain-text"
      ref={inputWrapperRef}
      onFocus={() => {
        if (value.trim().length > 0) {
          setIsOpen(true);
        }
      }}
    >
      <InputField
        id={`${baseId}-input`}
        className="w-full"
        fullWidth
        name={name}
        label={label}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        variant={variant}
        state={state}
        styleOverrides={{
          labelContainer:
            "h-6 inline-flex self-stretch pr-3 justify-start items-center gap-2"
        }}
        rightIcon={<SearchIcon />}
        role="combobox"
        aria-expanded={isDropdownOpen}
        aria-controls={items.length > 0 ? `${baseId}-list` : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 && isDropdownOpen && items.length > 0
            ? `${baseId}-option-${items[activeIndex].id}`
            : undefined
        }
      />

      {isDropdownOpen && (items.length > 0 || !!emptyMessage) && (
        <Popper
          id={`${baseId}-popper`}
          anchorEl={inputWrapperRef.current}
          anchorElWidth={inputWrapperRef.current?.offsetWidth}
          open={isDropdownOpen}
          position="bottom"
          handleClose={handleClose}
          ariaRole="presentation"
          ariaLabel={label || placeholder}
          isFlip
          disableAutoFocus
          positionStrategy={positionStrategy}
          containerClassName="rounded-md border border-secondary-accent bg-white shadow-lg"
        >
          <div ref={popperContentRef}>
            {items.length === 0 ? (
              emptyMessage && <div>{emptyMessage}</div>
            ) : (
              <ul
                className="max-h-50 overflow-y-auto"
                role="listbox"
                id={`${baseId}-list`}
                aria-label={label || placeholder}
              >
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    id={`${baseId}-option-${item.id}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`
                      px-4 py-2 cursor-pointer outline-none transition-all duration-150 border relative
                      ${
                        index === activeIndex
                          ? "border-primary-accent shadow-[0px_0px_4px_0px_rgba(0,0,0,0.60)] z-10 bg-primary-background/30 rounded"
                          : "border-transparent hover:bg-gray-100"
                      }
                    `}
                  >
                    {item.content}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Popper>
      )}
    </div>
  );
};

export default SearchableDropdown;
