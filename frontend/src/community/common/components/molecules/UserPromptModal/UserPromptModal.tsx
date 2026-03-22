import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  customComponent?: ReactNode;
  description?: string | JSX.Element;
  ids?: {
    title?: string;
    description?: string;
    closeButton?: string;
  };
  primaryBtn: {
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
    buttonStyle?: ButtonStyle;
    startIcon?: IconName;
    endIcon?: IconName;
    className?: string;
  };
  secondaryBtn?: {
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
    buttonStyle?: ButtonStyle;
    startIcon?: IconName;
    endIcon?: IconName;
    className?: string;
  };
}

const getVariant = (
  style?: ButtonStyle
): "primary" | "secondary" | "tertiary" => {
  if (style === ButtonStyle.TERTIARY) return "tertiary";
  if (style === ButtonStyle.SECONDARY) return "secondary";
  return "primary";
};

const UserPromptModal = ({
  customComponent,
  ids,
  description,
  primaryBtn,
  secondaryBtn
}: Props) => {
  return (
    <div>
      {customComponent}
      <p id={ids?.description ?? "user-prompt-modal-description"}>
        {description}
      </p>
      <div className="flex flex-row justify-end gap-3 mt-6">
        {secondaryBtn && (
          <ButtonV2
            variant={getVariant(secondaryBtn.buttonStyle ?? ButtonStyle.TERTIARY)}
            onClick={secondaryBtn.onClick}
            disabled={secondaryBtn.isDisabled ?? false}
            className={secondaryBtn.className}
            {...(secondaryBtn.startIcon && {
              icon: <Icon name={secondaryBtn.startIcon} />,
              iconPosition: "start"
            })}
            {...(secondaryBtn.endIcon && !secondaryBtn.startIcon && {
              icon: <Icon name={secondaryBtn.endIcon} />,
              iconPosition: "end"
            })}
          >
            {secondaryBtn.label}
          </ButtonV2>
        )}
        <ButtonV2
          variant={getVariant(primaryBtn.buttonStyle ?? ButtonStyle.PRIMARY)}
          onClick={primaryBtn.onClick}
          disabled={primaryBtn.isDisabled ?? false}
          className={primaryBtn.className}
          {...(primaryBtn.startIcon && {
            icon: <Icon name={primaryBtn.startIcon} />,
            iconPosition: "start"
          })}
          {...(primaryBtn.endIcon && !primaryBtn.startIcon && {
            icon: <Icon name={primaryBtn.endIcon} />,
            iconPosition: "end"
          })}
        >
          {primaryBtn.label}
        </ButtonV2>
      </div>
    </div>
  );
};

export default UserPromptModal;
