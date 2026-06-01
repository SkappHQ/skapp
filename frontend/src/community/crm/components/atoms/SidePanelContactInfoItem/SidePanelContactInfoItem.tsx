import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, ReactElement } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

import cls, { COLORS } from "./styles";

interface Props {
  icon: IconName | ReactElement;
  value: string | null;
  endIcon?: IconName;
  onClick?: () => void;
}

const renderIcon = (icon: IconName | ReactElement) =>
  typeof icon === "string" ? (
    <Icon name={icon} fill={COLORS.iconFill} width="20" height="20" />
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
      <div className={cls.row}>
        <span className={cls.iconWrapper}>{renderIcon(icon)}</span>
        <ButtonV2
          type="button"
          variant="line"
          size="sm"
          onClick={onClick}
          aria-label={value ?? "—"}
          className={cls.linkBtn}
        >
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
        </ButtonV2>
      </div>
    );
  }

  return (
    <div className={cls.row}>
      <span className={cls.iconWrapper}>{renderIcon(icon)}</span>
      <span className={value ? cls.plainText : cls.emptyText}>
        {value ?? "—"}
      </span>
    </div>
  );
};

export default SidePanelContactInfoItem;
