import { KeyboardKeys } from "~community/common/enums/KeyboardEnums";

export const getTabIndex = (isAccessible: boolean, index?: number): number => {
  if (index !== undefined) {
    return index;
  }
  return isAccessible ? 0 : -1;
};

// Navigation
export const shouldNavigateForward = (key: string) => key === KeyboardKeys.TAB;
export const shouldNavigateBackward = (key: string, shiftKey: boolean) =>
  key === KeyboardKeys.TAB && shiftKey;
export const shouldMoveUpward = (key: string) => key === KeyboardKeys.ARROW_UP;
export const shouldMoveDownward = (key: string) =>
  key === KeyboardKeys.ARROW_DOWN;
export const shouldMoveLeft = (key: string) => key === KeyboardKeys.ARROW_LEFT;
export const shouldMoveRight = (key: string) =>
  key === KeyboardKeys.ARROW_RIGHT;

// Link
export const shouldActivateLink = (key: string) => key === KeyboardKeys.ENTER;

// Button
export const shouldActivateButton = (key: string) =>
  key === KeyboardKeys.ENTER || key === KeyboardKeys.SPACE;

// Checkbox
export const shouldToggleCheckbox = (key: string) => key === KeyboardKeys.SPACE;

// Radio Buttons
export const shouldSelectFocusedRadio = (key: string) =>
  key === KeyboardKeys.SPACE;

export const shouldNavigateRadio = (key: string) =>
  [
    KeyboardKeys.ARROW_UP,
    KeyboardKeys.ARROW_DOWN,
    KeyboardKeys.ARROW_LEFT,
    KeyboardKeys.ARROW_RIGHT
  ].includes(key as KeyboardKeys);

// Dropdown (Select Menu)
export const shouldNavigateDropdownOptions = (key: string) =>
  key === KeyboardKeys.ARROW_UP || key === KeyboardKeys.ARROW_DOWN;

export const shouldExpandDropdown = (key: string) => key === KeyboardKeys.SPACE;

export const shouldCollapseDropdown = (key: string) =>
  key === KeyboardKeys.ESCAPE;

export const shouldSelectDropdownOption = (key: string) =>
  key === KeyboardKeys.ENTER;

// Autocomplete
export const shouldNavigateAutocompleteOptions = (key: string) =>
  key === KeyboardKeys.ARROW_UP || key === KeyboardKeys.ARROW_DOWN;

export const shouldSelectAutocompleteOption = (key: string) =>
  key === KeyboardKeys.ENTER;

// Dialog
export const shouldCloseDialog = (key: string) => key === KeyboardKeys.ESCAPE;

// Slider
export const shouldAdjustSlider = (key: string) =>
  [
    KeyboardKeys.ARROW_UP,
    KeyboardKeys.ARROW_DOWN,
    KeyboardKeys.ARROW_LEFT,
    KeyboardKeys.ARROW_RIGHT
  ].includes(key as KeyboardKeys);

export const shouldJumpToSliderEdge = (key: string) =>
  key === KeyboardKeys.HOME || key === KeyboardKeys.END;

export const shouldJumpSliderByPage = (key: string) =>
  key === KeyboardKeys.PAGE_UP || key === KeyboardKeys.PAGE_DOWN;

export const shouldToggleSliderThumb = (key: string, shiftKey: boolean) =>
  key === KeyboardKeys.TAB && shiftKey;

// Menu Bar
export const shouldNavigateMenu = (key: string) =>
  key === KeyboardKeys.ARROW_UP || key === KeyboardKeys.ARROW_DOWN;

export const shouldSelectMenuOption = (key: string) =>
  key === KeyboardKeys.ENTER;

export const shouldToggleSubmenu = (key: string) =>
  key === KeyboardKeys.ARROW_LEFT || key === KeyboardKeys.ARROW_RIGHT;

// Tab Panel
export const shouldNavigateTabs = (key: string) =>
  [
    KeyboardKeys.ARROW_LEFT,
    KeyboardKeys.ARROW_RIGHT,
    KeyboardKeys.ARROW_UP,
    KeyboardKeys.ARROW_DOWN
  ].includes(key as KeyboardKeys);

// Tree Menu
export const shouldNavigateTreeItem = (key: string) =>
  key === KeyboardKeys.ARROW_UP || key === KeyboardKeys.ARROW_DOWN;

export const shouldToggleTreeNode = (key: string) =>
  key === KeyboardKeys.ARROW_LEFT || key === KeyboardKeys.ARROW_RIGHT;

// Scroll
export const shouldScrollVertically = (key: string) =>
  key === KeyboardKeys.ARROW_UP || key === KeyboardKeys.ARROW_DOWN;

export const shouldScrollHorizontally = (key: string) =>
  key === KeyboardKeys.ARROW_LEFT || key === KeyboardKeys.ARROW_RIGHT;

export const shouldScrollByPage = (key: string, shiftKey: boolean) =>
  key === KeyboardKeys.SPACE && shiftKey;

export const getPopperAccessibilityProps = ({
  ariaLabel,
  ariaRole = "dialog",
  ariaLabelledBy
}: {
  ariaLabel?: string;
  ariaRole?: string;
  ariaLabelledBy?: string;
}) => {
  const isModal = ariaRole === "dialog" || ariaRole === "alertdialog";

  return {
    "aria-label": ariaLabel ?? undefined,
    "aria-modal": isModal ? true : undefined,
    "aria-labelledby": ariaLabelledBy,
    role: ariaRole,
    tabIndex: 0
  };
};
