import { Stack, Typography } from "@mui/material";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
import { FC, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import {
  getTabIndex,
  shouldActivateButton
} from "~community/common/utils/keyboardUtils";

import { styles } from "./styles";

interface Props {
  label: string;
  colors: string[];
  onClick: (value: string) => void;
  selectedColor: string;
  error?: string;
  required?: boolean;
  componentStyle?: SxProps;
}

const ColorPalette: FC<Props> = ({
  label,
  colors,
  componentStyle,
  onClick,
  selectedColor,
  error,
  required
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateAria = useTranslator(
    "commonAria",
    "components",
    "colorPalette"
  );

  const keyboardOpenedRef = useRef<boolean>(false);
  const secondRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anchorEl = useRef<HTMLDivElement | null>(null);

  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);

  const colorRows = useMemo(() => {
    const mid = Math.ceil(colors.length / 2);
    const firstRow = colors.slice(0, mid);
    const secondRow = colors.slice(mid);

    if (selectedColor && secondRow.includes(selectedColor)) {
      return [secondRow, firstRow];
    }

    return [firstRow, secondRow];
  }, [colors, selectedColor]);

  const firstRowColors = colorRows[0];
  const secondRowColors = colorRows[1];

  const handleColorClick = (color: string): void => {
    setIsPopperOpen(false);
    onClick(color);
  };

  const handleKeyDown = (e: KeyboardEvent, color: string): void => {
    if (shouldActivateButton(e.key)) {
      e.preventDefault();
      handleColorClick(color);
    }
  };

  const toggleDropdown = (fromKeyboard = false): void => {
    if (!isPopperOpen && fromKeyboard) {
      keyboardOpenedRef.current = true;
    }
    setIsPopperOpen(!isPopperOpen);
  };

  useMemo(() => {
    secondRowRefs.current = Array(secondRowColors.length).fill(null);
  }, [secondRowColors.length]);

  const handleDropdownKeyDown = (e: KeyboardEvent): void => {
    if (shouldActivateButton(e.key)) {
      e.preventDefault();
      toggleDropdown(true);
    }
  };

  // This effect handles focus management when the color palette dropdown is opened via keyboard
  useEffect(() => {
    // Only execute when the dropdown is open and was triggered by keyboard interaction
    if (isPopperOpen && keyboardOpenedRef.current && secondRowRefs.current[0]) {
      // Use requestAnimationFrame to ensure the DOM has been updated before setting focus
      requestAnimationFrame(() => {
        // Focus the first color in the second row when the dropdown opens
        secondRowRefs.current[0]?.focus();
        // Reset the keyboard opened state after focusing
        keyboardOpenedRef.current = false;
      });
    }
  }, [isPopperOpen]);

  return (
    <Stack sx={mergeSx([classes.wrapper, componentStyle])}>
      <Typography
        component="label"
        sx={{
          color: error
            ? theme.palette.error.contrastText
            : theme.palette.common.black
        }}
      >
        {label}
        {required && (
          <Typography component="span" sx={classes.asterisk}>
            &nbsp; *
          </Typography>
        )}
      </Typography>
      <Stack sx={classes.container}>
        <Stack
          ref={anchorEl}
          sx={{
            backgroundColor: error
              ? theme.palette.error.light
              : theme.palette.grey[100],
            border: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none",
            ...classes.field
          }}
        >
          <>
            <Stack
              data-testid="color-palette"
              sx={{
                height: isPopperOpen ? "max-content" : "28px",
                overflow: isPopperOpen ? "visible" : "hidden",
                ...classes.colorWidgetWrapper
              }}
            >
              {firstRowColors.map((color: string, index: number) => (
                <Stack
                  key={color}
                  data-testid={`input-color-${index}`}
                  tabIndex={0}
                  onClick={() => handleColorClick(color)}
                  onKeyDown={(e) => handleKeyDown(e, color)}
                  sx={{
                    ...classes.colorWidget,
                    backgroundColor: color
                  }}
                  role="button"
                  aria-label={translateAria(["pickColor"], {
                    color
                  })}
                >
                  {selectedColor === color && (
                    <Icon
                      name={IconName.CHECK_ICON}
                      fill={theme.palette.common.white}
                    />
                  )}
                </Stack>
              ))}
              {secondRowColors.map((color: string, index: number) => (
                <Stack
                  key={color}
                  data-testid={`input-color-${firstRowColors.length + index}`}
                  tabIndex={getTabIndex(isPopperOpen)}
                  onClick={() => handleColorClick(color)}
                  onKeyDown={(e) => handleKeyDown(e, color)}
                  sx={{
                    ...classes.colorWidget,
                    backgroundColor: color,
                    display: isPopperOpen ? "flex" : "none"
                  }}
                  role="button"
                  aria-label={translateAria(["pickColor"], {
                    color
                  })}
                  aria-hidden={!isPopperOpen}
                  ref={(el) => {
                    secondRowRefs.current[index] = el;
                  }}
                >
                  {selectedColor === color && (
                    <Icon
                      name={IconName.CHECK_ICON}
                      fill={theme.palette.common.white}
                    />
                  )}
                </Stack>
              ))}
            </Stack>
            <Stack
              onKeyDown={handleDropdownKeyDown}
              role="button"
              tabIndex={0}
              aria-label={
                isPopperOpen
                  ? translateAria(["close"])
                  : translateAria(["open"])
              }
              aria-expanded={isPopperOpen}
              onClick={() => toggleDropdown(false)}
              sx={classes.dropDownButtonWrapper}
            >
              <IconButton
                id="drop-down-icon-btn"
                icon={<Icon name={IconName.DROPDOWN_ARROW_ICON} />}
                buttonStyles={classes.dropDownButton}
                onClick={() => toggleDropdown(false)}
                ariaLabel={
                  isPopperOpen
                    ? translateAria(["close"])
                    : translateAria(["open"])
                }
                tabIndex={-1}
              />
            </Stack>
          </>
        </Stack>
      </Stack>
      {!!error && (
        <Typography
          role="alert"
          aria-live="assertive"
          variant="body2"
          sx={classes.error}
        >
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default ColorPalette;
