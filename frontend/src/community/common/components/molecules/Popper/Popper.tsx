import {
  Box,
  ClickAwayListener,
  Fade,
  Popper as MuiPopper
} from "@mui/material";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
import {
  CSSProperties,
  JSX,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef
} from "react";

import {
  MenuTypes,
  PopperAndTooltipPositionTypes
} from "~community/common/types/MoleculeTypes";
import {
  getPopperAccessibilityProps,
  shouldCollapseDropdown
} from "~community/common/utils/keyboardUtils";

import styles from "./styles";

type Props = {
  anchorEl: null | HTMLElement;
  anchorElWidth?: number;
  handleClose?: (e: MouseEvent | TouchEvent | KeyboardEvent) => void;
  position: PopperAndTooltipPositionTypes;
  menuType?: MenuTypes;
  isManager?: boolean;
  id: string | undefined;
  open: boolean;
  children?: ReactNode;
  disablePortal?: boolean;
  modifiers?: any;
  wrapperStyles?: Record<string, string> | CSSProperties;
  containerStyles?: Record<string, string> | SxProps;
  isFlip?: boolean;
  timeout?: number;
  ariaLabel?: string;
  ariaRole?: string;
  ariaLabelledBy?: string;
};

const Popper = ({
  anchorEl,
  anchorElWidth,
  handleClose = () => {},
  position,
  menuType,
  id,
  open,
  children,
  disablePortal,
  modifiers = [],
  wrapperStyles = {},
  containerStyles,
  isFlip = false,
  timeout = 0,
  ariaLabel,
  ariaRole = "dialog",
  ariaLabelledBy
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles();

  const popperRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  /**
   * This useEffect hook in your React component manages focus when the Popper component opens and closes.
   * When open is true, it stores the currently focused element, then attempts to focus the first focusable
   * element within the Popper. When open is false (Popper is closed), it restores focus to the element that
   * was focused before the Popper opened. requestAnimationFrame ensures the focus logic runs after the component
   * has been updated in the DOM. The logic previousActiveElement.current as HTMLElement | null)?.focus() uses the
   * optional chaining operator ?. to avoid errors if previousActiveElement.current is null.
   */
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;

      requestAnimationFrame(() => {
        const focusableElement = popperRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElement?.focus();
      });
    } else {
      (previousActiveElement.current as HTMLElement | null)?.focus();
    }
  }, [open]);

  const wrapperWidth = useMemo(() => {
    if (menuType === MenuTypes.SEARCH) {
      if (anchorElWidth) return `${anchorElWidth}px`;
      if (anchorEl) return `${anchorEl.clientWidth}px`;
      return "auto";
    }
    return undefined;
  }, [menuType, anchorElWidth, anchorEl]);

  const marginY = useMemo(() => {
    switch (menuType) {
      case MenuTypes.SEARCH || MenuTypes.SELECT:
        return "0.1875rem";
      case MenuTypes.DEFAULT:
        return "0rem !important";
      default:
        return "0.5rem !important";
    }
  }, [menuType]);

  const containerWidth = useMemo(() => {
    switch (menuType) {
      case MenuTypes.GRAPH || MenuTypes.SEARCH || MenuTypes.DEFAULT:
        return undefined;
      case MenuTypes.SORT || MenuTypes.SELECT:
        return "16.25rem";
      default:
        return "53.125rem";
    }
  }, [menuType]);

  const boxShadow = useMemo(() => {
    switch (menuType) {
      case MenuTypes.DEFAULT:
        return undefined;
      default:
        return `0rem 0.25rem 1.25rem ${theme.palette.grey.A200}`;
    }
  }, [menuType]);

  return (
    <MuiPopper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement={position}
      disablePortal={disablePortal}
      modifiers={[
        {
          name: "flip",
          enabled: isFlip,
          options: {
            altBoundary: true,
            rootBoundary: "document",
            padding: 8
          }
        },
        ...modifiers
      ]}
      transition
      style={{
        width: wrapperWidth,
        ...classes.wrapper,
        ...wrapperStyles
      }}
      slotProps={{
        root: {
          ...getPopperAccessibilityProps({
            ariaLabel: ariaLabel,
            ariaRole: ariaRole,
            ariaLabelledBy: ariaLabelledBy
          })
        }
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (shouldCollapseDropdown(e.key)) {
          handleClose(e);
        }
      }}
    >
      {({ TransitionProps }) => (
        <ClickAwayListener onClickAway={handleClose}>
          <Fade {...TransitionProps} timeout={timeout}>
            <Box
              ref={popperRef}
              sx={{
                ...classes.container,
                marginY: marginY,
                width: containerWidth,
                boxShadow: boxShadow,
                ...containerStyles
              }}
            >
              {children}
            </Box>
          </Fade>
        </ClickAwayListener>
      )}
    </MuiPopper>
  );
};

export default Popper;
