import { Stack, Theme, Typography, useTheme } from "@mui/material";
import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import Popper from "~community/common/components/molecules/Popper/Popper";
import {
  signedInUserSkipToContentList,
  unsignedInUserSkipToContentList
} from "~community/common/constants/commonConstants";
import { appModes } from "~community/common/constants/configs";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  shouldActivateButton,
  shouldCloseDialog,
  shouldCollapseDropdown,
  shouldNavigateBackward
} from "~community/common/utils/keyboardUtils";
import { useGetEnterpriseSkipToContentItems } from "~enterprise/common/hooks/useGetEnterpriseSkipToContentItems";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

import styles from "./styles";

const SkipToContentPopup = ({
  signedInUser = true
}: {
  signedInUser?: boolean;
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);
  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;

  const enterpriseSkipToContentItems = useGetEnterpriseSkipToContentItems();

  const translateAria = useTranslator("commonAria", "skipToContent");

  const buttonRef = useRef<HTMLButtonElement>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  const handleOpenPopper = () => {
    setAnchorEl(buttonRef.current);
    setIsPopperOpen(true);
  };

  const handleClosePopper = () => {
    setAnchorEl(null);
    setIsPopperOpen(false);
  };

  useEffect(() => {
    // Only execute when popup is closed and there's a focused item to handle
    if (!isPopperOpen && focusedItem) {
      // Find the DOM element referenced by the focusedItem selector
      const focusedElement = document.querySelector(focusedItem);

      if (focusedElement) {
        const htmlElement = focusedElement as HTMLElement;

        // Make the element keyboard focusable by adding tabindex
        htmlElement.setAttribute("tabindex", "0");

        // Focus the element without scrolling the page
        htmlElement.focus({ preventScroll: true });

        // Set up a one-time event listener to clean up when focus moves away
        // This removes the tabindex attribute when the element loses focus
        htmlElement.addEventListener(
          "blur",
          () => htmlElement.removeAttribute("tabindex"),
          { once: true } // Ensures the listener runs only once
        );
      }

      // Reset the focused item state after handling
      setFocusedItem(null);
    }
  }, [isPopperOpen, focusedItem]); // Re-run when popup state or focused item changes

  const listItems = useMemo(() => {
    if (signedInUser) {
      return isEnterprise
        ? enterpriseSkipToContentItems
        : signedInUserSkipToContentList;
    } else {
      return unsignedInUserSkipToContentList;
    }
  }, [signedInUser, isEnterprise, enterpriseSkipToContentItems]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (shouldCloseDialog(event.key)) {
        handleClosePopper();
      }

      const sectionIds = listItems.map((item) => item.id.split("#")[1]);

      if (
        sectionIds.includes(document.activeElement?.id ?? "") &&
        shouldNavigateBackward(event.key, event.shiftKey)
      ) {
        handleOpenPopper();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [listItems]);

  const handleOnButtonBlur = (event: FocusEvent<HTMLButtonElement>) => {
    if (
      !event.relatedTarget ||
      !event.relatedTarget.closest("#skip-to-content-popup")
    ) {
      handleClosePopper();
    }
  };

  const handleOnButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isPopperOpen && shouldCollapseDropdown(event.key)) {
      event.stopPropagation();
      handleClosePopper();
    }
  };

  const handleLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault();
    setFocusedItem(id);
    handleClosePopper();
  };

  const handleOnLinkKeyDown = (
    event: KeyboardEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (shouldActivateButton(event.key)) {
      handleClosePopper();
      setFocusedItem(id);
    }
  };

  return (
    <>
      <button
        id="skip-to-content-button"
        ref={buttonRef}
        aria-label={translateAria(["label"])}
        aria-haspopup="dialog"
        aria-expanded={isPopperOpen}
        aria-controls={isPopperOpen ? "skip-to-content-popup" : undefined}
        onFocus={() => handleOpenPopper()}
        onBlur={(event: FocusEvent<HTMLButtonElement>) =>
          handleOnButtonBlur(event)
        }
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) =>
          handleOnButtonKeyDown(e)
        }
        style={{
          position: "absolute",
          left: "0rem",
          top: "0rem",
          width: "0.0625rem",
          height: "0.0625rem",
          overflow: "hidden",
          zIndex: ZIndexEnums.SKIP_TO_CONTENT,
          border: "none"
        }}
      >
        {translateAria(["label"])}
      </button>
      <Popper
        id={isPopperOpen ? "skip-to-content-popup" : undefined}
        open={isPopperOpen}
        anchorEl={anchorEl}
        position="bottom-end"
        handleClose={handleClosePopper}
        containerStyles={classes.popperContainer}
        ariaRole="dialog"
        ariaLabel={translateAria(["skipTo"])}
      >
        <Stack>
          <Typography variant="label">{translateAria(["skipTo"])}</Typography>
          {listItems.map((item) => (
            <Typography
              key={item.label}
              tabIndex={0}
              component="a"
              variant="body2"
              sx={classes.linkText}
              href={item.id || undefined}
              onClick={(event: MouseEvent<HTMLAnchorElement>) =>
                handleLinkClick(event, item.id)
              }
              onKeyDown={(event: KeyboardEvent<HTMLAnchorElement>) =>
                handleOnLinkKeyDown(event, item.id)
              }
            >
              {translateAria([item.label])}
            </Typography>
          ))}
        </Stack>
      </Popper>
    </>
  );
};

export default SkipToContentPopup;
