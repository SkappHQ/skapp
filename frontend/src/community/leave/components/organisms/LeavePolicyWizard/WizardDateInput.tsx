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
        className={`text-sm font-medium ${
          disabled ? "text-gray-400" : "text-gray-900"
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
          className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-gray-100 px-4 py-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={formattedValue ? "text-gray-900" : "text-gray-500"}>
            {formattedValue || placeholder}
          </span>
          <CalendarIcon className="size-4 text-gray-600" />
        </button>
      </DatePicker>
    </div>
  );
};

export default WizardDateInput;
