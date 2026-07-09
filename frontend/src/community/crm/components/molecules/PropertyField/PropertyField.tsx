import { InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, KeyboardEvent, useEffect, useRef } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useInlineEditForm from "~community/crm/hooks/useInlineEditForm";

type PropertyFieldInputType = "text" | "number";

interface PropertyFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  inputType?: PropertyFieldInputType;
  min?: number;
  max?: number;
  validate?: (value: string) => string;
  onSave: (value: string) => void;
}

const PropertyField: FC<PropertyFieldProps> = ({
  label,
  value = "",
  placeholder,
  inputType = "text",
  min,
  max,
  validate,
  onSave
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const resolvedPlaceholder =
    placeholder ?? translateText(["placeholders", "none"]);
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
    <div className="self-stretch min-h-9 flex justify-start items-center">
      <div className="w-28 flex justify-start items-center gap-2 flex-shrink-0">
        <div className="text-black subtitle3">{label}</div>
      </div>

      <div className="flex-1 pl-4 min-h-[40px] min-w-0 flex items-center">
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
              autoFocus
            />
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            className="w-full min-w-0 min-h-[32px] px-3 rounded-lg flex items-center cursor-pointer hover:bg-secondary-background transition-colors"
            onClick={startEditing}
            onKeyDown={handleDisplayKeyDown}
          >
            <div
              className={`body2 tracking-wide truncate ${
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
