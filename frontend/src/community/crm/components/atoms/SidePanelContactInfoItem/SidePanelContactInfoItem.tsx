import { FC, KeyboardEvent, ReactElement } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

import styles, { COLORS } from "./styles";

interface Props {
  icon: IconName | ReactElement;
  value: string | null;
  endIcon?: IconName;
  onClick?: () => void;
}

const SidePanelContactInfoItem: FC<Props> = ({
  icon,
  value,
  endIcon,
  onClick
}) => {
  const cls = styles;

  const isInteractive = !!onClick && !!value;

  const inner = (
    <>
      <span className={cls.iconWrapper}>
        {typeof icon === "string" ? (
          <Icon name={icon} fill={COLORS.iconFill} width="20" height="20" />
        ) : (
          icon
        )}
      </span>
      {isInteractive ? (
        <span className={cls.link}>
          <span className={cls.linkText}>{value}</span>
          {endIcon && (
            <Icon
              name={endIcon}
              fill={COLORS.endIconFill}
              width="16"
              height="16"
            />
          )}
        </span>
      ) : (
        <span className={value ? cls.plainText : cls.emptyText}>
          {value ?? "—"}
        </span>
      )}
    </>
  );

  if (isInteractive) {
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cls.linkRow}
        aria-label={value ?? "-"}
      >
        {inner}
      </div>
    );
  }

  return <div className={cls.row}>{inner}</div>;
};

export default SidePanelContactInfoItem;
