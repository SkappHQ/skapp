import { InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC } from "react";

export interface AmountFieldProps {
  value: string;
  error: string | undefined;
  nonePlaceholder: string;
  ariaLabel: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const AmountField: FC<AmountFieldProps> = ({
  value,
  error,
  nonePlaceholder,
  ariaLabel,
  onChange
}) => {
  return (
    <div className="flex-1 min-w-0">
      <InputField
        name="amount"
        value={value}
        onChange={onChange}
        placeholder={nonePlaceholder}
        type="text"
        variant="sm"
        fullWidth
        state={error ? "error" : "default"}
        errorMessage={error}
        aria-label={ariaLabel}
        customStyles={{ background: "bg-white", border: "bg-white" }}
      />
    </div>
  );
};

export default AmountField;
