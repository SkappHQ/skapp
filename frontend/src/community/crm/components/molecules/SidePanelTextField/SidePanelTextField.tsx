import { InputField } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent } from "react";

import { useInlineEditForm } from "~community/crm/hooks/useInlineEditForm";

interface Props {
  id: string;
  value: string;
  placeholder: string;
  ariaLabel: string;
  validate?: (value: string) => string;
  onSave: (value: string) => void;
}

const SidePanelTextField: FC<Props> = ({
  id,
  value,
  placeholder,
  ariaLabel,
  validate,
  onSave
}) => {
  const {
    isEditing,
    value: editedValue,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({ value, validate, onSave });

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") void save();
    if (event.key === "Escape") discard();
  };

  if (isEditing) {
    return (
      <InputField
        id={`${id}-input`}
        value={editedValue}
        onChange={(event) => changeValue(event.target.value)}
        onBlur={() => void save()}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
        variant="sm"
        state={error ? "error" : "default"}
        errorMessage={error}
        aria-label={ariaLabel}
        fullWidth
        autoFocus
      />
    );
  }

  return (
    <button
      id={id}
      type="button"
      aria-label={ariaLabel}
      className="body2 w-full min-w-0 min-h-8 px-1 rounded-lg text-left cursor-pointer hover:bg-secondary-background"
      onClick={startEditing}
    >
      <span className="block truncate" title={value}>
        {value || placeholder}
      </span>
    </button>
  );
};

export default SidePanelTextField;
