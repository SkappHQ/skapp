import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  icon: IconName;
  value: string | null;
  isLink?: boolean;
  linkHref?: string;
  endIcon?: IconName;
}

const ContactInfoItem: FC<Props> = ({
  icon,
  value,
  isLink,
  linkHref,
  endIcon
}) => {
  const cls = styles;
  const iconFill = isLink && linkHref ? cls.linkIconFill : cls.iconFill;

  const inner = (
    <>
      <span className={cls.iconWrapper}>
        <Icon name={icon} fill={iconFill} width="20" height="20" />
      </span>
      {isLink && linkHref ? (
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

  if (isLink && linkHref) {
    return (
      <a
        href={linkHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cls.linkRow}
      >
        {inner}
      </a>
    );
  }

  return <div className={cls.row}>{inner}</div>;
};

export default ContactInfoItem;
