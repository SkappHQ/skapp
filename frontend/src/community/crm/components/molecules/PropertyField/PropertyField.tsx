import { InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, KeyboardEvent, useEffect, useRef } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useInlineEditForm } from "~community/crm/hooks/useInlineEditForm";

type PropertyFieldInputType = "text" | "number";

interface PropertyFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  inputType?: PropertyFieldInputType;
  min?: number;
  max?: number;
  ariaLabel?: string;
  validate?: (value: string) => string;
  onChange?: (value: string) => void;
  onSave: (value: string) => void;
}

const PropertyField: FC<PropertyFieldProps> = ({
  label,
  value = "",
  placeholder,
  inputType = "text",
  min,
  max,
  ariaLabel,
  validate,
  onChange,
  onSave
}) => {
  const translateText = useTranslator("crmModule");
  const resolvedPlaceholder =
    placeholder ?? translateText(["deals", "common", "placeholders", "none"]);
  const inputRef = useRef<HTMLDivElement>(null);

  const {
    isEditing,
    value: editedValue,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({ value, validate, onSave });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        isEditing
      ) {
        save();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, save]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    changeValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      save();
    } else if (e.key === "Escape") {
      discard();
    }
  };

  const handleDisplayKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") startEditing();
  };

  const displayValue = editedValue || resolvedPlaceholder;

  return (
    <div className="flex h-9 items-center justify-start self-stretch">
      <div className="flex w-28 flex-shrink-0 items-center justify-start gap-2">
        <div className="subtitle3 text-black">{label}</div>
      </div>

      <div className="flex min-h-[40px] min-w-0 flex-1 items-center pl-4">
        {isEditing ? (
          <div ref={inputRef} className="w-full">
            <InputField
              value={editedValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={resolvedPlaceholder}
              className="w-full"
              variant="sm"
              type={inputType}
              min={min}
              max={max}
              state={error ? "error" : "default"}
              errorMessage={error}
              aria-label={ariaLabel}
              autoFocus
            />
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            className="flex min-h-[32px] w-full min-w-0 cursor-pointer items-center rounded-lg px-3 transition-colors hover:bg-secondary-background"
            onClick={startEditing}
            onKeyDown={handleDisplayKeyDown}
            aria-label={ariaLabel}
          >
            <div
              className={`body2 truncate tracking-wide ${
                editedValue ? "text-black" : "text-secondary-icon"
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
