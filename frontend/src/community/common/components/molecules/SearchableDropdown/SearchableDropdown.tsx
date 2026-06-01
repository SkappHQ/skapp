'use client';

import React, { useState, useCallback, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { InputField, Popper, SearchIcon } from '@rootcodelabs/skapp-ui';

/** Mirrors InputFieldCustomStyles from @rootcodelabs/skapp-ui */
export interface InputFieldCustomStyles {
  borderRadius?: string;
  background?: string;
  border?: string;
  width?: string;
  gap?: string;
  padding?: string;
  hoverStyles?: { backgroundColor?: string; borderColor?: string };
  focusStyles?: { borderColor?: string; shadowColor?: string };
}

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
  customStyles?: InputFieldCustomStyles;
  state?: 'default' | 'error';
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  id,
  items,
  onSelect,
  value,
  onChange,
  placeholder = 'Search...',
  label,
  name,
  required = false,
  emptyMessage,
  customStyles,
  state = 'default',
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const popperContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(items.length > 0 ? 0 : -1);
    }
  }, [items.length, activeIndex]);

  const isDropdownOpen = open && (items.length > 0 || !!emptyMessage);

  const handleClose = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

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
        setOpen(true);
      } else {
        setOpen(false);
      }
    },
    [onChange]
  );

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen && e.key === 'ArrowDown' && items.length > 0) {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
        return;
      }

      if (!isDropdownOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextDown = activeIndex < items.length - 1 ? activeIndex + 1 : activeIndex;
          setActiveIndex(nextDown);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const nextUp = activeIndex > 0 ? activeIndex - 1 : 0;
          setActiveIndex(nextUp);
          break;
        case 'Tab':
          if (e.shiftKey) {
            handleClose();
            break;
          }

          if (items.length === 0 && popperContentRef.current) {
            const btn = popperContentRef.current.querySelector('button');
            if (btn) {
              e.preventDefault();
              btn.focus();
            } else {
              handleClose();
            }
          } else if (items.length > 0) {
            if (activeIndex === -1) {
              e.preventDefault();
              setActiveIndex(0);
            } else {
              if (activeIndex >= 0 && activeIndex < items.length) {
                handleSelect(items[activeIndex]);
              } else {
                handleClose();
              }
            }
          }
          break;
        case 'Enter':
          if (activeIndex >= 0 && activeIndex < items.length) {
            e.preventDefault();
            handleSelect(items[activeIndex]);
          } else if (items.length === 0 && popperContentRef.current) {
            const btn = popperContentRef.current.querySelector('button');
            if (btn) {
              e.preventDefault();
              btn.click();
              setTimeout(handleClose, 100);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    },
    [isDropdownOpen, items, activeIndex, handleSelect, handleClose]
  );

  return (
    <div className="w-full relative" ref={inputWrapperRef}>
      <InputField
        id={`${id}-input`}
        className="w-full"
        fullWidth
        name={name}
        label={label}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={() => {
          if (value.trim().length > 0) {
            setOpen(true);
          }
        }}
        variant="md"
        state={state}
        styleOverrides={{
          labelContainer: "h-6 inline-flex self-stretch pr-3 justify-start items-center gap-2"
        }}
        customStyles={customStyles}
        rightIcon={<SearchIcon />}
        role="combobox"
        aria-expanded={isDropdownOpen}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 && isDropdownOpen && items.length > 0
            ? `${id}-option-${items[activeIndex].id}`
            : undefined
        }
      />

      {isDropdownOpen && (items.length > 0 || !!emptyMessage) && (
        <Popper
          id={`${id}-popper`}
          anchorEl={inputWrapperRef.current}
          open={isDropdownOpen}
          position="bottom"
          handleClose={handleClose}
          ariaRole="presentation"
          ariaLabel={label || placeholder}
          isFlip
          disableAutoFocus
          containerClassName="rounded-md border border-secondary-accent bg-white shadow-lg"
        >
          <div ref={popperContentRef}>
            {items.length === 0 ? (
              emptyMessage && <div onClick={handleClose}>{emptyMessage}</div>
            ) : (
              <ul
                className="max-h-60 overflow-y-auto"
                role="listbox"
                id={`${id}-list`}
                aria-label={label || placeholder}
              >
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    id={`${id}-option-${item.id}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`
                      px-4 py-2 cursor-pointer outline-none transition-all duration-150 border relative
                      ${index === activeIndex
                        ? 'border-primary-accent shadow-[0px_0px_4px_0px_rgba(0,0,0,0.60)] z-10 bg-primary-background/30 rounded'
                        : 'border-transparent hover:bg-gray-100'
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
