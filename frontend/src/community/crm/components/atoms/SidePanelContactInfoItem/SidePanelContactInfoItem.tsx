import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, ReactElement } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  icon: IconName | ReactElement;
  value: string | null;
  endIcon?: IconName;
  onClick?: () => void;
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

const SidePanelContactInfoItem: FC<Props> = ({
  icon,
  value,
  endIcon,
  onClick
}) => {
  const isInteractive = !!onClick && !!value;

  if (isInteractive) {
    return (
      <div className="flex items-center gap-[12px]">
        <span className="shrink-0 flex items-center">{renderIcon(icon)}</span>
        <ButtonV2
          type="button"
          variant="line"
          size="sm"
          onClick={onClick}
          aria-label={value ?? "—"}
          className="group !cursor-pointer !p-0 !min-w-0 !justify-start !h-auto !rounded-[4px] hover:!bg-transparent focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-[var(--color-primary-accent)] focus-visible:!ring-offset-2"
        >
          <span className="flex items-center gap-[4px] transition-colors text-primary-text cursor-pointer group-hover:text-[var(--color-primary-accent)]">
            <span className="body2 leading-6 tracking-[0.5px] underline">
              {value}
            </span>
            {endIcon && (
              <Icon name={endIcon} fill="currentColor" width="16" height="16" />
            )}
          </span>
        </ButtonV2>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[12px]">
      <span className="shrink-0 flex items-center">{renderIcon(icon)}</span>
      <span
        className={
          value
            ? "body2 leading-6 tracking-[0.5px] text-black"
            : "body2 leading-6 tracking-[0.5px] text-primary-text"
        }
      >
        {value ?? "—"}
      </span>
    </div>
  );
};

export default SidePanelContactInfoItem;
