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
  validate?: (value: string) => string | undefined;
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
  validate,
  onChange,
  onSave
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const resolvedPlaceholder =
    placeholder ?? translateText(["placeholders", "none"]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value);
  const [validationError, setValidationError] = useState<string | undefined>(
    undefined
  );
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const commit = (nextValue: string): boolean => {
    if (validate) {
      const error = validate(nextValue);
      if (error) {
        setValidationError(error);
        return false;
      }
    }
    setValidationError(undefined);
    if (nextValue !== value) {
      if (onSave) {
        onSave(nextValue);
        setInputValue(value);
      } else if (onChange) {
        onChange(nextValue);
      }
    }
    return true;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        isEditing
      ) {
        if (commit(inputValue)) {
          setIsEditing(false);
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
      setValidationError(undefined);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInputValue(nextValue);
    if (validate) {
      setValidationError(validate(nextValue));
    }
    if (onChange) {
      onChange(nextValue);
    }
  };

  const handleSave = () => {
    if (commit(inputValue)) {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(value);
      setValidationError(undefined);
    }
  };

  const handleDisplayKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") handleClick();
  };

  const displayValue = inputValue || resolvedPlaceholder;

  return (
    <div className="self-stretch min-h-9 flex justify-start items-center">
      <div className="w-28 flex justify-start items-center gap-2 flex-shrink-0">
        <div className="text-black subtitle3">{label}</div>
      </div>

      <div className="flex-1 pl-4 min-h-[40px] min-w-0 flex items-center">
        {isEditing ? (
          <div ref={inputRef} className="w-full">
            <InputField
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={resolvedPlaceholder}
              className="w-full"
              variant="sm"
              type={inputType}
              min={min}
              max={max}
              state={validationError ? "error" : "default"}
              errorMessage={validationError}
              autoFocus
            />
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            className="w-full min-w-0 min-h-[32px] px-3 rounded-lg flex items-center cursor-pointer hover:bg-secondary-background transition-colors"
            onClick={handleClick}
            onKeyDown={handleDisplayKeyDown}
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
