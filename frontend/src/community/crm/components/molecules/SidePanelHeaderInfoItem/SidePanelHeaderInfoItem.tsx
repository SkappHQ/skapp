import { FC, ReactElement } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

interface SidePanelHeaderInfoItemProps {
  icon: ReactElement;
  value: string;
  endIcon?: IconName;
  onClick?: () => void;
}

const SidePanelHeaderInfoItem: FC<SidePanelHeaderInfoItemProps> = ({
  icon,
  value,
  endIcon,
  onClick
}) => {
  const isInteractive = !!onClick;

  return (
    <div className="flex items-center gap-[12px]">
      <span className="flex shrink-0 items-center">{icon}</span>
      {isInteractive ? (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex cursor-pointer items-center gap-[4px] border-0 bg-transparent p-0 transition-opacity hover:opacity-80"
        >
          <span className="body2 leading-6 tracking-[0.5px] text-primary-text underline">
            {value}
          </span>
          {endIcon && (
            <Icon
              name={endIcon}
              fill="var(--color-primary-text)"
              width="16"
              height="16"
            />
          )}
        </button>
      ) : (
        <span className="body2 leading-6 tracking-[0.5px] text-black">
          {value}
        </span>
      )}
    </div>
  );
};

export default SidePanelHeaderInfoItem;
