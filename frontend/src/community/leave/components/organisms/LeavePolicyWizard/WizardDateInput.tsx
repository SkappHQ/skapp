import { CalendarIcon, DatePicker } from "@rootcodelabs/skapp-ui";
import { JSX, useState } from "react";

interface Props {
  label: string;
  placeholder: string;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  disabled?: boolean;
}

const WizardDateInput = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false
}: Props): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const formattedValue = value
    ? value.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "";

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        className={`subtitle3 ${
          disabled ? "text-tertiary-text" : "text-black"
        }`}
      >
        {label}
      </label>
      <DatePicker
        mode="single"
        selected={value}
        onSelect={(date: Date | undefined) => {
          onChange(date);
          setIsOpen(false);
        }}
        isOpen={isOpen}
        onOpenChange={(open: boolean) => {
          if (!disabled) {
            setIsOpen(open);
          }
        }}
      >
        <button
          type="button"
          disabled={disabled}
          aria-label={label}
          className="body2 flex w-full cursor-pointer items-center justify-between rounded-lg bg-tertiary-background px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={formattedValue ? "text-black" : "text-tertiary-text"}>
            {formattedValue || placeholder}
          </span>
          <CalendarIcon className="size-4 text-secondary-icon" />
        </button>
      </DatePicker>
    </div>
  );
};

export default WizardDateInput;
