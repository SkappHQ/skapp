"use client";

import { InputField } from "@rootcodelabs/skapp-ui";
import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

type PropertyFieldInputType = "text" | "number";

interface PropertyFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  inputType?: PropertyFieldInputType;
  min?: number;
  max?: number;
  errorMessage?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
}

const PropertyField: FC<PropertyFieldProps> = ({
  label,
  value = "",
  placeholder,
  inputType = "text",
  min,
  max,
  errorMessage,
  onChange,
  onSave
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const resolvedPlaceholder =
    placeholder ?? translateText(["placeholders", "none"]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value);
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
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, inputValue, value]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setInputValue(value);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleSave = () => {
    if (onSave) {
      setIsEditing(false);
      onSave(inputValue);
      setInputValue(value);
    } else if (onChange) {
      onChange(inputValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(value);
    }
  };

  const displayValue = inputValue || resolvedPlaceholder;

  return (
    <div className="self-stretch h-9 flex justify-start items-center">
      <div className="w-28 flex justify-start items-center gap-2 flex-shrink-0">
        <div className="text-black subtitle3">{label}</div>
      </div>

      <div className="flex-1 pl-4 min-h-[40px] min-w-0 flex items-center">
        {isEditing ? (
          <div ref={inputRef} className="w-full">
            <InputField
              customStyles={{ background: "secondary-background" }}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={resolvedPlaceholder}
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
            className="w-full min-w-0 min-h-[32px] px-3 rounded-lg flex items-center cursor-pointer hover:bg-secondary-background transition-colors"
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }}
          >
            <div
              className={`body2 tracking-wide truncate ${
                inputValue ? "text-black" : "text-secondary-icon"
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
