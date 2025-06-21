import { Box, Chip, type SxProps, useTheme } from "@mui/material";
import { KeyboardEvent, forwardRef, useCallback, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { TooltipPlacement } from "~community/common/enums/ComponentEnums";
import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

import styles from "./styles";

interface Props {
  withTooltip?: boolean;
  label: string | undefined;
  chipStyles?: SxProps | undefined;
  isResponsive?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  onDeleteIcon?: (label?: string) => void;
  isTooltipEnabled?: boolean;
  id?: string;
  dataTestId?: string;
  coloredCloseIcon?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  tabIndex?: number;
  ariaHidden?: boolean;
}

const BasicChip = forwardRef<HTMLDivElement, Props>(
  (
    {
      withTooltip = true,
      label,
      isResponsive = false,
      onClick,
      onKeyDown,
      chipStyles,
      onDeleteIcon,
      isTooltipEnabled = false,
      id,
      dataTestId,
      coloredCloseIcon = false,
      onMouseEnter,
      onMouseLeave,
      tabIndex,
      ariaHidden
    }: Props,
    ref
  ) => {
    const theme = useTheme();
    const classes = styles(theme);

    // TODO: Is a custom breakpoint needed here? can't we use an existing breakpoint?
    const queryMatches = useMediaQuery();
    const isBelow1350 = queryMatches(1350);

    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const renderChip = useCallback(() => {
      const handleTooltipOpen = () => {
        if (isTooltipEnabled) {
          setIsTooltipOpen(true);
        }
      };

      const closeTooltip = () => {
        if (isTooltipEnabled) {
          setIsTooltipOpen(false);
        }
      };

      return (
        <Chip
          ref={ref}
          id={id}
          data-testid={dataTestId}
          aria-label={label}
          label={
            isBelow1350 && isResponsive
              ? label
                  ?.split(" ")
                  .slice(0, 2)
                  .filter((word) => word !== undefined)
                  .join(" ")
              : label
          }
          sx={mergeSx([classes.chipContainer, chipStyles])}
          onClick={onClick}
          onKeyDown={onKeyDown}
          onDelete={onDeleteIcon ? () => onDeleteIcon(label) : undefined}
          deleteIcon={
            <Box
              tabIndex={0}
              onKeyDown={(e) => {
                if (shouldActivateButton(e.key) && onDeleteIcon) {
                  onDeleteIcon();
                }
              }}
            >
              <Icon
                name={IconName.CLOSE_ICON}
                fill={coloredCloseIcon ? theme.palette.primary.dark : "black"} // TODO: use the theme color
              />
            </Box>
          }
          onMouseEnter={onMouseEnter ?? handleTooltipOpen}
          onMouseLeave={onMouseLeave ?? closeTooltip}
          tabIndex={tabIndex}
          aria-hidden={ariaHidden}
        />
      );
    }, [
      chipStyles,
      classes.chipContainer,
      coloredCloseIcon,
      dataTestId,
      id,
      isBelow1350,
      isResponsive,
      isTooltipEnabled,
      label,
      onClick,
      onDeleteIcon,
      onKeyDown,
      onMouseEnter,
      onMouseLeave,
      ref,
      tabIndex,
      ariaHidden,
      theme.palette.primary.dark
    ]);

    const renderComponent = useCallback(() => {
      if (withTooltip) {
        return (
          <Tooltip
            title={label ?? ""}
            placement={TooltipPlacement.BOTTOM}
            open={isTooltipOpen}
            tabIndex={tabIndex}
          >
            {renderChip()}
          </Tooltip>
        );
      }
      return renderChip();
    }, [isTooltipOpen, label, renderChip, withTooltip, tabIndex]);

    return renderComponent();
  }
);

BasicChip.displayName = "BasicChip";

export default BasicChip;
