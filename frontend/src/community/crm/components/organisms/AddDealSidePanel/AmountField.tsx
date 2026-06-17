import { InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, FocusEvent } from "react";

export interface AmountFieldProps {
  isEditing: boolean;
  value: string;
  isTouched: boolean | undefined;
  error: string | undefined;
  placeholder: string;
  nonePlaceholder: string;
  ariaLabel: string;
  onEdit: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
}

const AmountField: FC<AmountFieldProps> = ({
  isEditing,
  value,
  isTouched,
  error,
  placeholder,
  nonePlaceholder,
  ariaLabel,
  onEdit,
  onChange,
  onBlur
}) => {
  if (isEditing) {
    return (
      <div className="flex-1 min-w-0">
        <InputField
          name="amount"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          type="text"
          variant="sm"
          fullWidth
          autoFocus
          state={isTouched && error ? "error" : "default"}
          errorMessage={isTouched ? error : undefined}
          aria-label={ariaLabel}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <button
        type="button"
        className={`body2 text-left w-full pl-1 ${
          value ? "text-black" : "text-tertiary-text"
        }`}
        onClick={onEdit}
      >
        {value || nonePlaceholder}
      </button>
      {isTouched && error && (
        <p className="text-semantic-red-text body3 mt-1">{error}</p>
      )}
    </div>
  );
};

export default AmountField;
