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

  return (
    <div className={cls.row}>
      <span className={cls.iconWrapper}>
        <Icon name={icon} fill={cls.iconFill} width="16" height="16" />
      </span>
      {isLink && linkHref ? (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cls.link}
        >
          <span className={cls.linkText}>{value}</span>
          {endIcon && (
            <Icon
              name={endIcon}
              fill={cls.endIconFill}
              width="16"
              height="16"
            />
          )}
        </a>
      ) : (
        <span className={value ? cls.plainText : cls.emptyText}>
          {value ?? "—"}
        </span>
      )}
    </div>
  );
};

export default ContactInfoItem;
