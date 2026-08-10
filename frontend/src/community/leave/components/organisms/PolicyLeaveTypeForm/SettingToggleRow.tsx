import { Toggle } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SettingToggleRow: FC<Props> = ({
  label,
  checked,
  onChange,
  disabled = false
}) => (
  <div className="flex flex-row items-center justify-between gap-4">
    <p className={`body1 ${disabled ? "text-disabled-text" : "text-black"}`}>
      {label}
    </p>
    <Toggle
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      ariaLabel={label}
    />
  </div>
);

export default SettingToggleRow;
