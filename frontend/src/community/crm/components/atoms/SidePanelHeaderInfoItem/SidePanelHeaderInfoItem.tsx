import { FC, ReactElement } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  icon: IconName | ReactElement;
  value: string | null;
  endIcon?: IconName;
  href?: string;
}

const renderIcon = (icon: IconName | ReactElement) =>
  typeof icon === "string" ? (
    <Icon
      name={icon}
      fill="var(--color-secondary-icon)"
      width="20"
      height="20"
    />
  ) : (
    icon
  );

const SidePanelHeaderInfoItem: FC<Props> = ({ icon, value, endIcon, href }) => {
  const isInteractive = !!href && !!value;

  return (
    <div className="flex items-center gap-[12px]">
      <span className="shrink-0 flex items-center">{renderIcon(icon)}</span>
      {isInteractive ? (
        <a
          href={href}
          className="inline-flex items-center gap-[4px] transition-colors hover:opacity-80"
          target="_blank"
          rel="noopener noreferrer"
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
        </a>
      ) : (
        <span className="body2 leading-6 tracking-[0.5px] text-black">
          {value ?? "—"}
        </span>
      )}
    </div>
  );
};

export default SidePanelHeaderInfoItem;
