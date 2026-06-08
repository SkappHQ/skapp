import { FC, ReactElement } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  icon: ReactElement;
  value: string | null;
  endIcon?: IconName;
  onClick?: () => void;
}

const SidePanelHeaderInfoItem: FC<Props> = ({
  icon,
  value,
  endIcon,
  onClick
}) => {
  const isInteractive = !!onClick && !!value;

  return (
    <div className="flex items-center gap-[12px]">
      <span className="shrink-0 flex items-center">{icon}</span>
      {isInteractive ? (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-[4px] bg-transparent border-0 p-0 cursor-pointer transition-opacity hover:opacity-80"
        >
          <span className="body2 leading-6 tracking-[0.5px] underline text-primary-text">
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
          {value ?? "—"}
        </span>
      )}
    </div>
  );
};

export default SidePanelHeaderInfoItem;
