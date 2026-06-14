import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from '@rootcodelabs/skapp-ui';
import PriorityLabel from '~community/crm/components/atoms/PriorityLabel/PriorityLabel';
import { CrmPriorityEnum } from '~community/crm/enums/common';
import useGetPriorityOptions from '~community/crm/hooks/useGetPriorityOptions';

interface PriorityDropdownProps {
  value?: CrmPriorityEnum;
  onChange?: (value: CrmPriorityEnum) => void;
  onSave?: (value: CrmPriorityEnum) => void;
  onCancel?: () => void;
}

const PriorityDropdown: React.FC<PriorityDropdownProps> = ({
  value = CrmPriorityEnum.MEDIUM,
  onChange,
  onSave,
}) => {
  const priorityOptions = useGetPriorityOptions();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<CrmPriorityEnum>(value);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || CrmPriorityEnum.MEDIUM);
  }, [value]);

  useEffect(() => {
    if (isEditing && dropdownRef.current) {
      const timeout = setTimeout(() => {
        const trigger = dropdownRef.current?.querySelector(
          'button, [role="button"], .dropdown-trigger',
        );
        if (trigger) {
          (trigger as HTMLElement).click();
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        isEditing
      ) {
        setIsEditing(false);
        if (inputValue) {
          if (onSave) {
            onSave(inputValue);
          } else if (onChange) {
            onChange(inputValue);
          }
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, inputValue, onSave, onChange]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setInputValue(value);
    }
  };

  const handleDropdownChange = (selectedValue: string) => {
    const priority = selectedValue as CrmPriorityEnum;
    setInputValue(priority);
    setIsEditing(false);
    if (onChange) {
      onChange(priority);
    }
    if (onSave) {
      onSave(priority);
    }
  };

  return (
    <div className="flex items-center">
      {isEditing ? (
        <div ref={inputRef} className="w-full">
          <div ref={dropdownRef}>
            <Dropdown
              value={inputValue}
              onChange={handleDropdownChange}
              className="bg-gray-50 rounded-lg"
              options={priorityOptions}
              variant="jsx-content"
              width="100%"
            />
          </div>
        </div>
      ) : (
        <div
          className="min-h-[32px] rounded-lg inline-flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleClick}
        >
          <div className="flex items-center py-2 px-1 gap-2">
            <PriorityLabel priority={inputValue} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityDropdown;
