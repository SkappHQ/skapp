import { FC, KeyboardEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  icon: IconName;
  value: string | null;
  endIcon?: IconName;
  onClick?: () => void;
}

const ContactInfoItem: FC<Props> = ({
  icon,
  value,
  endIcon,
  onClick
}) => {
  const cls = styles;

  const isInteractive = !!onClick;

  const inner = (
    <>
      <span className={cls.iconWrapper}>
        <Icon name={icon} fill={cls.iconFill} width="20" height="20" />
      </span>
      {isInteractive ? (
        <span className={cls.link}>
          <span className={cls.linkText}>{value}</span>
          {endIcon && (
            <Icon
              name={endIcon}
              fill={cls.endIconFill}
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
      >
        {inner}
      </div>
    );
  }

  return <div className={cls.row}>{inner}</div>;
};

export interface ContactInfoItemSkeletonProps {
  widthClass?: string;
  hasEndIcon?: boolean;
}

export const ContactInfoItemSkeleton: FC<ContactInfoItemSkeletonProps> = ({
  widthClass = "w-[80px]",
  hasEndIcon = false
}) => {
  return (
    <div className="flex items-center gap-[12px] animate-pulse">
      <div className="h-5 w-5 rounded bg-[#F5F5F5] shrink-0" />
      <div className={`h-[14px] ${widthClass} rounded bg-[#F5F5F5]`} />
      {hasEndIcon && (
        <div className="h-4 w-4 rounded bg-[#F5F5F5] shrink-0 ml-[4px]" />
      )}
    </div>
  );
};

export default ContactInfoItem;
