import {
  ButtonProps,
  CircularProgress,
  SxProps,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { JSX, MouseEvent as ReactMouseEvent, useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { BrandingBlueColor } from "~community/common/constants/stringConstants";
import {
  ButtonSizes,
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { getTabIndex } from "~community/common/utils/keyboardUtils";

import StyledButton from "./StyledButton";

export interface StyledButtonProps {
  id?: string;
  accessibility?: {
    ariaDescription?: string;
    ariaDescribedBy?: string;
    ariaHidden?: boolean;
  };
  ariaLabel?: string;
  ariaDisabled?: boolean;
  dataTestId?: string;
  dataAttr?: Record<string, unknown>;
  isLoading?: boolean;
  buttonStyle?: ButtonStyle;
  size?: ButtonSizes;
  type?: ButtonTypes | undefined;
  label: string;
  isFullWidth?: boolean;
  startIcon?: IconName | JSX.Element | null;
  endIcon?: IconName | JSX.Element | null;
  styles?: SxProps<Theme>;
  disabled?: boolean;
  onClick?: ButtonProps["onClick"];
  onMouseEnter?: ButtonProps["onMouseEnter"];
  onMouseLeave?: ButtonProps["onMouseLeave"];
  isDefaultIconColor?: boolean;
  isStrokeAvailable?: boolean;
  shouldBlink?: boolean;
  title?: string;
}

const Button = ({
  id,
  dataTestId,
  accessibility,
  ariaLabel,
  ariaDisabled = false,
  title,
  dataAttr,
  isLoading = false,
  buttonStyle = ButtonStyle.PRIMARY,
  size = ButtonSizes.LARGE,
  disabled = false,
  type = undefined,
  label,
  isFullWidth = true,
  startIcon = null,
  endIcon = null,
  styles,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isDefaultIconColor = false,
  isStrokeAvailable = false,
  shouldBlink = false
}: StyledButtonProps): JSX.Element => {
  const theme = useTheme();

  const typographyVariant = useMemo(() => {
    switch (size) {
      case ButtonSizes.SMALL:
        return "caption";
      case ButtonSizes.MEDIUM:
        return "body2";
      case ButtonSizes.LARGE:
        return "body1";
      default:
        return "body1";
    }
  }, [size]);

  const circularProgressSize = useMemo(() => {
    switch (size) {
      case ButtonSizes.SMALL:
        return "1rem";
      case ButtonSizes.LARGE:
      case ButtonSizes.MEDIUM:
        return "1.25rem";
      default:
        return "1.25rem";
    }
  }, [size]);

  const color = useMemo(() => {
    switch (buttonStyle) {
      case ButtonStyle.PRIMARY:
      case ButtonStyle.TERTIARY:
        return theme.palette.common.black;
      case ButtonStyle.SECONDARY:
        return theme.palette.primary.dark;
      case ButtonStyle.BLUE_OUTLINED:
        return BrandingBlueColor.primary.dark;
      case ButtonStyle.ERROR:
        return theme.palette.text.error;
      default:
        return theme.palette.common.black;
    }
  }, [
    buttonStyle,
    theme.palette.common.black,
    theme.palette.primary.dark,
    theme.palette.text.error
  ]);

  const handleClick = (
    event: ReactMouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!isLoading && !disabled) {
      onClick?.(event);
    }
  };

  return (
    <StyledButton
      {...dataAttr}
      id={id}
      role="button"
      data-testid={dataTestId}
      aria-label={ariaLabel}
      aria-describedby={accessibility?.ariaDescribedBy}
      aria-hidden={accessibility?.ariaHidden}
      aria-disabled={ariaDisabled}
      title={title}
      disableElevation
      type={type}
      textcolor={color ?? theme.palette.common.black}
      variant="contained"
      buttonstyle={buttonStyle}
      buttonsize={size}
      isdefaulticoncolor={isDefaultIconColor.toString()}
      isstrokeavailable={isStrokeAvailable.toString()}
      width={isFullWidth ? "100%" : "max-content"}
      shouldblink={shouldBlink}
      isDisabled={disabled}
      tabIndex={getTabIndex(!disabled)}
      startIcon={
        startIcon && typeof startIcon === "object" && "type" in startIcon ? (
          startIcon
        ) : (
          <Icon
            name={startIcon as IconName}
            fill={disabled ? theme.palette.grey[800] : color}
          />
        )
      }
      endIcon={
        isLoading ? (
          <CircularProgress size={circularProgressSize} role="progressbar" />
        ) : endIcon && typeof endIcon === "object" && "type" in endIcon ? (
          endIcon
        ) : (
          <Icon
            name={endIcon as IconName}
            fill={disabled ? theme.palette.grey[800] : color}
          />
        )
      }
      sx={mergeSx([
        styles,
        {
          pointerEvents: isLoading || disabled ? "none" : "auto",
          minWidth: label ? "4rem" : "1rem"
        }
      ])}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {label && (
        <Typography variant={typographyVariant} component="span">
          {label}
        </Typography>
      )}
    </StyledButton>
  );
};

export default Button;
