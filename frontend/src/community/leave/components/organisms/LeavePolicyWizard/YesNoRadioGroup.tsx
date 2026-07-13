import { JSX } from "react";

interface Props {
  label: string;
  name: string;
  noLabel: string;
  yesLabel: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const YesNoRadioGroup = ({
  label,
  name,
  noLabel,
  yesLabel,
  value,
  onChange
}: Props): JSX.Element => {
  const options = [
    { id: `${name}-no`, label: noLabel, optionValue: false },
    { id: `${name}-yes`, label: yesLabel, optionValue: true }
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="subtitle3 text-black">{label}</p>
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
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary-accent"
            >
              {value === option.optionValue && (
                <span className="size-3 rounded-full bg-primary-accent" />
              )}
            </span>
            <span className="body2 text-black">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default YesNoRadioGroup;
