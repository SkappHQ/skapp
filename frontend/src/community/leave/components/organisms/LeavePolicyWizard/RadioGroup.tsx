import { RadioButton } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

interface Props {
  label: string;
  name: string;
  noLabel: string;
  yesLabel: string;
  value: boolean;
  onChange?: (value: boolean) => void;
  isDisabled?: boolean;
}

const RadioGroup: FC<Props> = ({
  label,
  name,
  noLabel,
  yesLabel,
  value,
  onChange,
  isDisabled = false
}) => {
  const options = [
    { id: `${name}-no`, label: noLabel, optionValue: false },
    { id: `${name}-yes`, label: yesLabel, optionValue: true }
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="subtitle1 text-black">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            id={option.id}
            type="button"
            role="radio"
            aria-checked={value === option.optionValue}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => onChange?.(option.optionValue)}
            className={`flex w-fit items-center gap-3 ${
              isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            }`}
          >
            <RadioButton
              isSelected={value === option.optionValue}
              variant="dot"
            />
            <span className="body2 text-black">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
