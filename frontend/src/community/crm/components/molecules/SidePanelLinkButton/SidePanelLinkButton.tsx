import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

interface SidePanelLinkButtonProps {
  label: string;
  onClick: () => void;
}

const SidePanelLinkButton: FC<SidePanelLinkButtonProps> = ({
  label,
  onClick
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-[4px] min-w-0 max-w-full bg-transparent border-0 p-0 cursor-pointer transition-opacity hover:opacity-80"
  >
    <span className="body2 leading-6 tracking-[0.5px] underline text-primary-text truncate">
      {label}
    </span>
    <Icon
      name={IconName.POP_OUT_ICON}
      fill="var(--color-primary-text)"
      width="16"
      height="16"
    />
  </button>
);

export default SidePanelLinkButton;
