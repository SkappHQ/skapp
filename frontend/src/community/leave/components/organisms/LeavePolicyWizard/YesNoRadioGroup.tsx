import { RadioButton } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

interface Props {
  label: string;
  name: string;
  noLabel: string;
  yesLabel: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const YesNoRadioGroup: FC<Props> = ({
  label,
  name,
  noLabel,
  yesLabel,
  value,
  onChange
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
            onClick={() => onChange(option.optionValue)}
            className="flex w-fit cursor-pointer items-center gap-3"
          >
            <RadioButton isSelected={value === option.optionValue} />
            <span className="body2 text-black">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default YesNoRadioGroup;
