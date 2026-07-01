'use client';

import { InputField } from '@rootcodelabs/skapp-ui';
import React, { useEffect, useRef, useState } from 'react';

interface PropertyFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  inputType?: 'text' | 'number';
  min?: number;
  max?: number;
  errorMessage?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
}

const PropertyField: React.FC<PropertyFieldProps> = ({
  label,
  value = '',
  placeholder = 'None',
  inputType = 'text',
  min,
  max,
  errorMessage,
  onChange,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        isEditing
      ) {
        setIsEditing(false);
        if (onSave) {
          onSave(inputValue);
          setInputValue(value);
        } else if (onChange) {
          onChange(inputValue);
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, inputValue, value, onSave, onChange]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setInputValue(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) {
      onSave(inputValue);
      setInputValue(value);
    } else if (onChange) {
      onChange(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(value);
    }
  };

  const displayValue = inputValue || placeholder;

  return (
    <div className="self-stretch h-9 flex justify-start items-center">
      <div className="w-28 flex justify-start items-center gap-2 flex-shrink-0">
        <div className="text-black subtitle3">{label}</div>
      </div>

      <div className="flex-1 pl-4 min-h-[40px] min-w-0 flex items-center">
        {isEditing ? (
          <div ref={inputRef} className="w-full">
            <InputField
              customStyles={{ background: 'gray-50' }}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full"
              variant="sm"
              type={inputType}
              min={min}
              max={max}
              autoFocus
            />
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            className="w-full min-w-0 min-h-[32px] px-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleClick();
            }}
          >
            <div
              className={`body2 tracking-wide truncate ${
                inputValue ? 'text-black' : 'text-secondary-icon'
              }`}
              title={displayValue}
            >
              {displayValue}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyField;
